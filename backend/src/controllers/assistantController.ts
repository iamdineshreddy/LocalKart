import { Request, Response } from 'express';
import {
    processTextList,
    processImageList,
} from '../services/shoppingAssistantService';
import {
    getPersonalizedRecommendations,
    getTrendingProducts,
    getPopularProducts,
} from '../services/mlSearchService';

/**
 * Assistant Controller
 * Smart shopping assistant (text/image → cart) + product recommendations
 */

// Parse text grocery list → matched products
export const parseTextList = async (req: Request, res: Response): Promise<void> => {
    try {
        const { text } = req.body;

        if (!text || text.trim().length < 2) {
            res.status(400).json({ success: false, message: 'Text input is required' });
            return;
        }

        const results = await processTextList(text);

        res.status(200).json({
            success: true,
            message: `Matched ${results.filter(r => r.product).length} of ${results.length} items`,
            items: results,
        });
    } catch (error) {
        console.error('Parse text list error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Parse image (base64) → OCR → matched products
export const parseImageList = async (req: Request, res: Response): Promise<void> => {
    try {
        const { image } = req.body;

        if (!image) {
            res.status(400).json({ success: false, message: 'Base64 image data is required' });
            return;
        }

        // Strip data URI prefix if present
        const base64Data = image.replace(/^data:image\/\w+;base64,/, '');

        const results = await processImageList(base64Data);

        res.status(200).json({
            success: true,
            message: `Matched ${results.filter(r => r.product).length} of ${results.length} items`,
            items: results,
        });
    } catch (error: any) {
        console.error('Parse image list error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to process image',
        });
    }
};

// Get personalized product recommendations for logged-in user
export const getRecommendations = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user?.id;
        const { latitude, longitude, limit = 20 } = req.query;

        const lat = parseFloat(latitude as string) || 0;
        const lng = parseFloat(longitude as string) || 0;

        const products = await getPersonalizedRecommendations(
            userId,
            lat,
            lng,
            parseInt(limit as string)
        );

        res.status(200).json({
            success: true,
            products,
        });
    } catch (error) {
        console.error('Get recommendations error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Get trending products (public)
export const getTrending = async (req: Request, res: Response): Promise<void> => {
    try {
        const { latitude, longitude, days = 7, limit = 20 } = req.query;

        const lat = parseFloat(latitude as string) || 0;
        const lng = parseFloat(longitude as string) || 0;

        const products = await getTrendingProducts(
            lat,
            lng,
            parseInt(days as string),
            parseInt(limit as string)
        );

        res.status(200).json({ success: true, products });
    } catch (error) {
        console.error('Get trending error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Get popular products (public)
export const getPopular = async (req: Request, res: Response): Promise<void> => {
    try {
        const { latitude, longitude, limit = 20 } = req.query;

        const lat = parseFloat(latitude as string) || 0;
        const lng = parseFloat(longitude as string) || 0;

        const products = await getPopularProducts(
            lat,
            lng,
            parseInt(limit as string)
        );

        res.status(200).json({ success: true, products });
    } catch (error) {
        console.error('Get popular error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
