import { Product } from '../models/Product';
import natural from 'natural';

/**
 * Smart Shopping Assistant Service
 *
 * Converts grocery lists (text or image) into matched product arrays:
 *  1. Text input  → NLP tokenization → fuzzy match against DB products
 *  2. Image input → Gemini Vision API → extract text → same pipeline
 *
 * Uses `natural` library (already installed) for string distance matching.
 */

const tokenizer = new natural.WordTokenizer();

// Common grocery quantity patterns: "2 kg rice", "500g dal", "1 dozen eggs"
const QUANTITY_REGEX = /^(\d+(?:\.\d+)?)\s*(kg|g|gm|gms|gram|grams|litre|liter|l|lt|ml|dozen|dz|packet|pkt|pack|pc|pcs|piece|pieces|unit|units|box|bunch|bundle)?\.?\s*/i;

interface ParsedItem {
    raw: string;           // original text
    name: string;          // cleaned product name
    quantity?: number;
    unit?: string;
}

interface MatchedProduct {
    parsedItem: ParsedItem;
    product: {
        id: string;
        name: string;
        price: number;
        category: string;
        imageUrl: string;
        stock: number;
    } | null;
    confidence: number;    // 0-1 match confidence
}

// Parse raw text into structured item list
export const parseGroceryListFromText = (text: string): ParsedItem[] => {
    // Split by newlines, commas, semicolons, or numbered list patterns
    const lines = text
        .split(/[\n,;]+/)
        .map(l => l.replace(/^\s*\d+[\.\)\-]?\s*/, '').trim()) // strip "1.", "2)", etc.
        .filter(l => l.length > 1);

    return lines.map(line => {
        const match = line.match(QUANTITY_REGEX);
        if (match) {
            return {
                raw: line,
                name: line.replace(QUANTITY_REGEX, '').trim(),
                quantity: parseFloat(match[1]),
                unit: match[2]?.toLowerCase(),
            };
        }
        return { raw: line, name: line };
    });
};

// Use Gemini Vision API to extract text from image (via REST API)
export const parseGroceryListFromImage = async (imageBase64: string): Promise<string> => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error('GEMINI_API_KEY not configured');
    }

    try {
        const axios = (await import('axios')).default;
        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
            {
                contents: [{
                    parts: [
                        {
                            inlineData: {
                                mimeType: 'image/jpeg',
                                data: imageBase64,
                            }
                        },
                        {
                            text: 'Extract all grocery/food item names from this image. Return them as a simple comma-separated list. Include quantities if visible. Only return the list, nothing else.'
                        }
                    ]
                }]
            },
            { headers: { 'Content-Type': 'application/json' } }
        );

        return response.data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    } catch (error) {
        console.error('Gemini OCR error:', error);
        throw new Error('Failed to process image. Please try text input instead.');
    }
};


// Fuzzy match parsed items against products in database
export const matchProductsInDB = async (items: ParsedItem[]): Promise<MatchedProduct[]> => {
    // Get all active products (for fuzzy matching)
    const allProducts = await Product.find({ isActive: true })
        .select('name price category thumbnailUrl imageUrls stock')
        .lean();

    return items.map(item => {
        let bestMatch: any = null;
        let bestScore = 0;

        const searchName = item.name.toLowerCase();

        for (const product of allProducts) {
            const productName = product.name.toLowerCase();

            // 1. Exact substring match scores highest
            if (productName.includes(searchName) || searchName.includes(productName)) {
                const score = 0.9;
                if (score > bestScore) {
                    bestScore = score;
                    bestMatch = product;
                }
                continue;
            }

            // 2. Jaro-Winkler distance for fuzzy matching
            const jaroDistance = natural.JaroWinklerDistance(searchName, productName, {});
            if (jaroDistance > bestScore && jaroDistance > 0.6) {
                bestScore = jaroDistance;
                bestMatch = product;
            }

            // 3. Token overlap (e.g. "basmati rice" vs "Premium Basmati Rice 1kg")
            const searchTokens = tokenizer.tokenize(searchName) || [];
            const productTokens = tokenizer.tokenize(productName) || [];
            const overlap = searchTokens.filter(t => productTokens.some(pt => pt.includes(t) || t.includes(pt)));
            const tokenScore = searchTokens.length > 0 ? overlap.length / searchTokens.length : 0;
            if (tokenScore > bestScore && tokenScore > 0.5) {
                bestScore = tokenScore;
                bestMatch = product;
            }
        }

        return {
            parsedItem: item,
            product: bestMatch ? {
                id: bestMatch._id.toString(),
                name: bestMatch.name,
                price: bestMatch.price,
                category: bestMatch.category,
                imageUrl: bestMatch.thumbnailUrl || bestMatch.imageUrls?.[0] || '',
                stock: bestMatch.stock,
            } : null,
            confidence: Math.round(bestScore * 100) / 100,
        };
    });
};

// Full pipeline: text → parse → match
export const processTextList = async (text: string): Promise<MatchedProduct[]> => {
    const items = parseGroceryListFromText(text);
    return matchProductsInDB(items);
};

// Full pipeline: image → OCR → parse → match
export const processImageList = async (imageBase64: string): Promise<MatchedProduct[]> => {
    const extractedText = await parseGroceryListFromImage(imageBase64);
    const items = parseGroceryListFromText(extractedText);
    return matchProductsInDB(items);
};
