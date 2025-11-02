import { Modality } from "@google/genai";
import { ai } from '../../core/api/geminiClient';
import { fileToGenerativePart } from "../../utils/imageUtils";
import { LayerType } from "../../types";

const createLayerPrompt = (layerType: LayerType): string => {
    switch (layerType) {
        case LayerType.BACKGROUND:
            return "Create a professional, high-quality, well-lit, and symmetrical background suitable for an advertising flyer. It must contain no text or watermarks. Render with ultra-realistic detail. The output must be a transparent PNG of the same dimensions as the original.";
        case LayerType.PERSON:
            return "Create a realistic central character with professional lighting. The background must be transparent. Ensure the character is in a centered position, respecting the framing. If there are no people, return a completely transparent image.";
        case LayerType.TEXT:
            return "Design the main text of the flyer with clean, visible, and legible typography. The text should be centered relative to the overall design. Do not include any brands or logos. The output must be a transparent PNG with no background.";
    }
}

const extractLayer = async (imagePart: { inlineData: { data: string, mimeType: string } }, layerType: LayerType): Promise<string> => {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
            parts: [
                imagePart,
                { text: createLayerPrompt(layerType) },
            ],
        },
        config: {
            responseModalities: [Modality.IMAGE],
        },
    });

    const generatedImage = response.candidates?.[0]?.content?.parts
        .find(part => part.inlineData);
    
    if (generatedImage?.inlineData) {
        return `data:${generatedImage.inlineData.mimeType};base64,${generatedImage.inlineData.data}`;
    } else {
        throw new Error(`Failed to extract ${layerType} layer.`);
    }
}

export const separateLayers = async (file: File) => {
    const imagePart = await fileToGenerativePart(file);
    
    const results = await Promise.allSettled([
        extractLayer(imagePart, LayerType.BACKGROUND),
        extractLayer(imagePart, LayerType.PERSON),
        extractLayer(imagePart, LayerType.TEXT),
    ]);

    return {
        [LayerType.BACKGROUND]: results[0].status === 'fulfilled' ? results[0].value : undefined,
        [LayerType.PERSON]: results[1].status === 'fulfilled' ? results[1].value : undefined,
        [LayerType.TEXT]: results[2].status === 'fulfilled' ? results[2].value : undefined,
    };
};

export const createNewImageFromPrompt = async (prompt: string): Promise<string> => {
     const fullPrompt = `
        Create a new, professional flyer based on the following description: "${prompt}".
        The style should be modern and clean.
        The output must be a high-quality image suitable for a flyer, with a transparent background (PNG).
     `;

     const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: fullPrompt }] },
        config: { responseModalities: [Modality.IMAGE] },
    });

    const generatedImage = response.candidates?.[0]?.content?.parts.find(part => part.inlineData);
    if (generatedImage?.inlineData) {
        return `data:${generatedImage.inlineData.mimeType};base64,${generatedImage.inlineData.data}`;
    } else {
        throw new Error("Failed to create new image from prompt.");
    }
};
