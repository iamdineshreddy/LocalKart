import { Request, Response } from 'express';
import { Review } from '../models/Review';
import { Product } from '../models/Product';
import { Order } from '../models/Order';
import { calculateTrustScore } from '../services/trustScoreService';

/**
 * Review Controller
 * Handles product/store reviews with verified purchase validation
 */

// Create a review (authenticated buyers)
export const createReview = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user?.id;
        const { productId, storeId, orderId, rating, title, text } = req.body;

        if (!productId || !storeId || !rating || !text) {
            res.status(400).json({ success: false, message: 'productId, storeId, rating, and text are required' });
            return;
        }

        if (rating < 1 || rating > 5) {
            res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
            return;
        }

        // Check if user already reviewed this product
        const existing = await Review.findOne({ userId, productId });
        if (existing) {
            res.status(400).json({ success: false, message: 'You have already reviewed this product' });
            return;
        }

        // Verify purchase if orderId provided
        let isVerifiedPurchase = false;
        if (orderId) {
            const order = await Order.findOne({
                _id: orderId,
                userId,
                orderStatus: 'delivered',
                'items.productId': productId
            });
            isVerifiedPurchase = !!order;
        }

        const review = new Review({
            userId,
            productId,
            storeId,
            orderId,
            rating,
            title,
            text,
            isVerifiedPurchase,
        });
        await review.save();

        // Update product average rating
        const productReviews = await Review.aggregate([
            { $match: { productId: review.productId, isActive: true } },
            { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } }
        ]);
        if (productReviews.length > 0) {
            await Product.findByIdAndUpdate(productId, {
                rating: Math.round(productReviews[0].avg * 10) / 10,
                reviewCount: productReviews[0].count,
            });
        }

        // Recalculate trust score for the store's seller
        try {
            const product = await Product.findById(productId).populate('storeId');
            if (product?.storeId) {
                const store = product.storeId as any;
                await calculateTrustScore(store.ownerId?.toString(), store._id?.toString());
            }
        } catch (e) {
            console.error('Trust score update after review failed:', e);
        }

        res.status(201).json({
            success: true,
            message: 'Review submitted successfully',
            review,
        });
    } catch (error: any) {
        if (error.code === 11000) {
            res.status(400).json({ success: false, message: 'You have already reviewed this product' });
            return;
        }
        console.error('Create review error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Get reviews for a product
export const getProductReviews = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { page = 1, limit = 20, sort = 'recent' } = req.query;

        const sortOption: any = sort === 'helpful' ? { helpfulCount: -1 } : { createdAt: -1 };

        const reviews = await Review.find({ productId: id, isActive: true })
            .populate('userId', 'name profileImage')
            .sort(sortOption)
            .skip((parseInt(page as string) - 1) * parseInt(limit as string))
            .limit(parseInt(limit as string));

        const total = await Review.countDocuments({ productId: id, isActive: true });

        // Aggregate rating distribution
        const distribution = await Review.aggregate([
            { $match: { productId: require('mongoose').Types.ObjectId.createFromHexString(id), isActive: true } },
            { $group: { _id: '$rating', count: { $sum: 1 } } },
            { $sort: { _id: -1 } }
        ]);

        res.status(200).json({
            success: true,
            reviews,
            total,
            distribution: distribution.map(d => ({ rating: d._id, count: d.count })),
        });
    } catch (error) {
        console.error('Get product reviews error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Get reviews for a store
export const getStoreReviews = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { page = 1, limit = 20 } = req.query;

        const reviews = await Review.find({ storeId: id, isActive: true })
            .populate('userId', 'name profileImage')
            .populate('productId', 'name thumbnailUrl')
            .sort({ createdAt: -1 })
            .skip((parseInt(page as string) - 1) * parseInt(limit as string))
            .limit(parseInt(limit as string));

        const total = await Review.countDocuments({ storeId: id, isActive: true });

        res.status(200).json({ success: true, reviews, total });
    } catch (error) {
        console.error('Get store reviews error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Mark review as helpful
export const markHelpful = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        await Review.findByIdAndUpdate(id, { $inc: { helpfulCount: 1 } });
        res.status(200).json({ success: true, message: 'Marked as helpful' });
    } catch (error) {
        console.error('Mark helpful error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
