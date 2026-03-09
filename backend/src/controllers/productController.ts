import { Request, Response } from 'express';
import { Product } from '../models/Product';
import { Store } from '../models/Store';
import { mlProductSearch, getPriceRecommendations, getPersonalizedRecommendations, getTrendingProducts, getSearchSuggestions } from '../services/mlSearchService';

// ML-powered product search
export const searchProducts = async (req: Request, res: Response): Promise<void> => {
    try {
        const {
            q,
            latitude,
            longitude,
            category,
            minPrice,
            maxPrice,
            rating,
            inStock,
            page = 1,
            limit = 20
        } = req.query;

        const result = await mlProductSearch(
            q as string || '',
            latitude ? parseFloat(latitude as string) : undefined,
            longitude ? parseFloat(longitude as string) : undefined,
            {
                category: category as string,
                minPrice: minPrice ? parseFloat(minPrice as string) : undefined,
                maxPrice: maxPrice ? parseFloat(maxPrice as string) : undefined,
                rating: rating ? parseFloat(rating as string) : undefined,
                inStock: inStock === 'true'
            },
            parseInt(page as string),
            parseInt(limit as string)
        );

        res.status(200).json({
            success: true,
            ...result
        });
    } catch (error) {
        console.error('Search products error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Get search suggestions
export const getSuggestions = async (req: Request, res: Response): Promise<void> => {
    try {
        const { q, limit = 10 } = req.query;

        if (!q) {
            res.status(400).json({ success: false, message: 'Query required' });
            return;
        }

        const suggestions = await getSearchSuggestions(q as string, parseInt(limit as string));

        res.status(200).json({
            success: true,
            suggestions
        });
    } catch (error) {
        console.error('Get suggestions error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Get price recommendations for a product
export const getProductPriceRecommendations = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, category, latitude, longitude } = req.query;

        if (!latitude || !longitude) {
            res.status(400).json({ success: false, message: 'Location required' });
            return;
        }

        const recommendations = await getPriceRecommendations(
            name as string,
            category as string,
            parseFloat(latitude as string),
            parseFloat(longitude as string)
        );

        res.status(200).json({
            success: true,
            ...recommendations
        });
    } catch (error) {
        console.error('Get price recommendations error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Get personalized recommendations
export const getRecommendations = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user?.id;
        const { latitude, longitude, limit = 20 } = req.query;

        if (!latitude || !longitude) {
            res.status(400).json({ success: false, message: 'Location required' });
            return;
        }

        let products;
        if (userId) {
            products = await getPersonalizedRecommendations(
                userId,
                parseFloat(latitude as string),
                parseFloat(longitude as string),
                parseInt(limit as string)
            );
        } else {
            products = await getTrendingProducts(
                parseFloat(latitude as string),
                parseFloat(longitude as string),
                7,
                parseInt(limit as string)
            );
        }

        res.status(200).json({
            success: true,
            products
        });
    } catch (error) {
        console.error('Get recommendations error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Get trending products
export const getTrending = async (req: Request, res: Response): Promise<void> => {
    try {
        const { latitude, longitude, limit = 20 } = req.query;

        if (!latitude || !longitude) {
            res.status(400).json({ success: false, message: 'Location required' });
            return;
        }

        const products = await getTrendingProducts(
            parseFloat(latitude as string),
            parseFloat(longitude as string),
            7,
            parseInt(limit as string)
        );

        res.status(200).json({
            success: true,
            products
        });
    } catch (error) {
        console.error('Get trending error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Get product details
export const getProductDetails = async (req: Request, res: Response): Promise<void> => {
    try {
        const { productId } = req.params;

        const product = await Product.findById(productId)
            .populate('storeId', 'storeName rating location phone');

        if (!product) {
            res.status(404).json({ success: false, message: 'Product not found' });
            return;
        }

        // Increment view count
        await Product.findByIdAndUpdate(productId, { $inc: { viewCount: 1 } });

        res.status(200).json({
            success: true,
            product
        });
    } catch (error) {
        console.error('Get product details error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Create product (seller)
export const createProduct = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user?.id;
        const productData = req.body;

        // Get seller's store
        const store = await Store.findOne({ ownerId: userId });
        if (!store) {
            res.status(400).json({ success: false, message: 'You need a store to add products' });
            return;
        }

        const product = new Product({
            ...productData,
            storeId: store._id,
            priceHistory: [{ price: productData.price, date: new Date() }]
        });

        await product.save();

        res.status(201).json({
            success: true,
            message: 'Product created successfully',
            product
        });
    } catch (error) {
        console.error('Create product error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Update product (seller)
export const updateProduct = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user?.id;
        const { productId } = req.params;
        const updates = req.body;

        // Verify ownership
        const store = await Store.findOne({ ownerId: userId });
        if (!store) {
            res.status(403).json({ success: false, message: 'Unauthorized' });
            return;
        }

        // Track price changes
        if (updates.price) {
            const product = await Product.findById(productId);
            if (product && product.price !== updates.price) {
                updates.priceHistory = [
                    ...product.priceHistory,
                    { price: updates.price, date: new Date() }
                ];
            }
        }

        const product = await Product.findOneAndUpdate(
            { _id: productId, storeId: store._id },
            updates,
            { new: true }
        );

        if (!product) {
            res.status(404).json({ success: false, message: 'Product not found' });
            return;
        }

        res.status(200).json({
            success: true,
            product
        });
    } catch (error) {
        console.error('Update product error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Delete product (seller)
export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user?.id;
        const { productId } = req.params;

        const store = await Store.findOne({ ownerId: userId });
        if (!store) {
            res.status(403).json({ success: false, message: 'Unauthorized' });
            return;
        }

        await Product.findOneAndDelete({ _id: productId, storeId: store._id });

        res.status(200).json({
            success: true,
            message: 'Product deleted'
        });
    } catch (error) {
        console.error('Delete product error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Get seller's products
export const getMyProducts = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user?.id;
        const { page = 1, limit = 20 } = req.query;

        const store = await Store.findOne({ ownerId: userId });
        if (!store) {
            res.status(400).json({ success: false, message: 'No store found' });
            return;
        }

        const products = await Product.find({ storeId: store._id })
            .skip((parseInt(page as string) - 1) * parseInt(limit as string))
            .limit(parseInt(limit as string));

        const total = await Product.countDocuments({ storeId: store._id });

        res.status(200).json({
            success: true,
            products,
            total,
            page: parseInt(page as string),
            pages: Math.ceil(total / parseInt(limit as string))
        });
    } catch (error) {
        console.error('Get my products error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Get products by category
export const getProductsByCategory = async (req: Request, res: Response): Promise<void> => {
    try {
        const { category } = req.params;
        const { latitude, longitude, page = 1, limit = 20 } = req.query;

        if (!latitude || !longitude) {
            res.status(400).json({ success: false, message: 'Location required' });
            return;
        }

        const result = await mlProductSearch(
            '',
            parseFloat(latitude as string),
            parseFloat(longitude as string),
            { category },
            parseInt(page as string),
            parseInt(limit as string)
        );

        res.status(200).json({
            success: true,
            ...result
        });
    } catch (error) {
        console.error('Get products by category error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
