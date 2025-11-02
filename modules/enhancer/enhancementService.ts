import { Modality } from "@google/genai";
import { ai } from '../../core/api/geminiClient';
import { fileToGenerativePart } from "../../utils/imageUtils";
import { LayerType, EnhancementSettings } from "../../types";

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
