
import { GoogleGenAI, Type } from "@google/genai";

export const generateProductDescription = async (productName: string, category: string, keywords: string) => {
  // Always use the recommended initialization with process.env.API_KEY directly
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Create a compelling, mouth-watering product description for a local grocery marketplace.
      Product Name: ${productName}
      Category: ${category}
      Additional Keywords: ${keywords}
      
      Keep it professional yet warm, highlighting freshness and quality. Max 3 sentences.`,
      config: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
      },
    });

    return response.text;
  } catch (error) {
    console.error("Error generating description:", error);
    return "Failed to generate description. Please write one manually.";
  }
};