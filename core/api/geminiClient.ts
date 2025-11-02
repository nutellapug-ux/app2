import { GoogleGenAI } from "@google/genai";

// Centralized AI client instance to be used across all modules.
export const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
