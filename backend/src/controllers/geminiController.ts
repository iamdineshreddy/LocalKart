import { Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';

// Initialize Gemini safely from backend env
export const generateContent = async (req: Request, res: Response): Promise<void> => {
    try {
        const { prompt, type } = req.body;

        if (!prompt) {
            res.status(400).json({ success: false, message: 'Prompt is required' });
            return;
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            res.status(500).json({ success: false, message: 'Gemini API key not configured on server' });
            return;
        }

        const ai = new GoogleGenAI({ apiKey });

        let systemPrompt = '';
        if (type === 'product_description') {
            systemPrompt = 'Create a compelling, mouth-watering product description for a local grocery marketplace. Keep it professional yet warm, highlighting freshness and quality. Max 3 sentences.\n\n';
        } else if (type === 'recipe_idea') {
            systemPrompt = 'I have these items in my grocery cart. Suggest one quick and delicious meal I can make with these (or mostly these) in 2 sentences. Be creative!\n\n';
        }

        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: systemPrompt + prompt,
            config: {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
            },
        });

        res.status(200).json({ success: true, text: response.text });
    } catch (error) {
        console.error('Gemini proxy error:', error);
        res.status(500).json({ success: false, message: 'Failed to generate content' });
    }
};
