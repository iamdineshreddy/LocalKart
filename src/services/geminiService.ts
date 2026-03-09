import { api } from './api';

export const generateProductDescription = async (productName: string, category: string, keywords: string) => {
  try {
    const prompt = `Product Name: ${productName}\nCategory: ${category}\nAdditional Keywords: ${keywords}`;
    const response = await api.generateAIContent(prompt, 'product_description');
    return response.text;
  } catch (error) {
    console.error("Error generating description:", error);
    return "Failed to generate description. Please write one manually.";
  }
};