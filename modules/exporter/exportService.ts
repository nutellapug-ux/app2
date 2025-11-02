import { Modality } from "@google/genai";
import { ai } from '../../core/api/geminiClient';
import { fileToGenerativePart } from "../../utils/imageUtils";
import { ExportSettings } from "../../types";

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
