import { Modality } from "@google/genai";
import { ai } from '../../core/api/geminiClient';
import { fileToGenerativePart } from "../../utils/imageUtils";

const RESTORATION_PROMPT = `
You are a world-class AI specializing in professional image restoration and enhancement.
Your primary task is to improve and clean the provided image while preserving all original design elements, including branding and artistic features.
Analyze the image and perform the following actions:
1.  **Correct Imperfections:** Detect and fix graphical imperfections such as noise, pixelation, compression artifacts, or unwanted visual distortions.
2.  **Reconstruct Details:** Use content-aware techniques to rebuild details in affected regions seamlessly.
3.  **Enhance Clarity:** Improve overall sharpness, contrast, and lighting, ensuring the result looks natural.
4.  **Preserve Integrity:** Maintain the original style, color tones, composition, and symmetry. Do NOT remove any logos, branding, or intentionally created artistic features.
Your final output should be a single, restored image, ready for professional use.
`;

export const restoreImageQuality = async (file: File): Promise<string> => {
    try {
        const imagePart = await fileToGenerativePart(file);

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [
                    imagePart,
                    { text: RESTORATION_PROMPT },
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
            console.error("Image restoration failed, AI did not return an image.", response);
            throw new Error("Failed to restore image quality: AI response was empty.");
        }
    } catch (error) {
        console.error("Error during image restoration AI call:", error);
        throw new Error("An error occurred during the image restoration process.");
    }
};
