import { GoogleGenAI, Modality } from "@google/genai";
import { fileToGenerativePart } from "../utils/imageUtils";
import { LayerType, EnhancementSettings, ExportSettings } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

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

export const enhanceLayer = async (imageDataUrl: string, layerType: LayerType, settings: EnhancementSettings) => {
    const res = await fetch(imageDataUrl);
    const blob = await res.blob();
    const file = new File([blob], `layer.${blob.type.split('/')[1]}`, { type: blob.type });
    const imagePart = await fileToGenerativePart(file);

    const prompt = `
    Enhance this '${layerType}' layer of a flyer based on the following settings.
    - Model: ${settings.model}
    - Resolution: ${settings.resolution}
    - Image Style: ${settings.style}
    - Creativity: ${settings.creativity}
    - User Prompt: ${settings.prompt || 'No specific changes requested, just general enhancement based on the settings.'}
    Return only the enhanced image.
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
            parts: [
                imagePart,
                { text: prompt },
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
        throw new Error(`Failed to enhance ${layerType} layer.`);
    }
};

export const exportImage = async (imageDataUrl: string, settings: ExportSettings): Promise<string> => {
    const res = await fetch(imageDataUrl);
    const blob = await res.blob();
    const file = new File([blob], `composite.${blob.type.split('/')[1]}`, { type: blob.type });
    const imagePart = await fileToGenerativePart(file);

    const prompt = `
    Analyze the uploaded flyer composite. Enhance its resolution using super-resolution to ${settings.resolution}.
    Ensure every element remains sharp, symmetrical, and aligned with the original composition.
    Export the final version as a high-quality, transparent ${settings.format}.
    Automatically correct any artifacts, edges, or halos that affect the quality of the render.
    The output must be a single, high-resolution image.
    `;
    
     const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [imagePart, { text: prompt }] },
        config: { responseModalities: [Modality.IMAGE] },
    });
    
    const generatedImage = response.candidates?.[0]?.content?.parts.find(part => part.inlineData);
    if (generatedImage?.inlineData) {
        return `data:${generatedImage.inlineData.mimeType};base64,${generatedImage.inlineData.data}`;
    } else {
        throw new Error("Failed to export image with AI upscaling.");
    }
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
