import { GoogleGenAI } from "@google/genai";

export function createGeminiClient(apiKey: string) {
  return new GoogleGenAI({ apiKey });
}
