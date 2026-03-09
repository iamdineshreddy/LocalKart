import { Store } from '../models/Store';
import { Order } from '../models/Order';
import { Review } from '../models/Review';
import { FraudReport } from '../models/FraudReport';
import { TrustScore, ITrustScore } from '../models/TrustScore';
import { User } from '../models/User';

/**
 * Trust Score Service
 * 
 * Calculates seller reliability using weighted formula:
 *   totalScore = (ratingScore × 0.4) + (orderScore × 0.3) + (kycScore × 0.2) + (fraudScore × 0.1)
 * 
 * Each sub-score is normalized to 0-100.
 * Badge assignment:
 *   - verified: KYC approved + score >= 85
 *   - gold: score >= 75
 *   - silver: score >= 50
 *   - bronze: score >= 25
 *   - none: score < 25
 */

// Calculate trust score for a single seller/store
export const calculateTrustScore = async (sellerId: string, storeId: string): Promise<ITrustScore> => {
    // 1. KYC Score — 100 if verified, 50 if submitted, 0 otherwise
    const store = await Store.findById(storeId);
    let kycScore = 0;
    if (store) {
        if (store.kycStatus === 'verified') kycScore = 100;
        else if (store.kycStatus === 'submitted') kycScore = 50;
        else if (store.kycStatus === 'pending') kycScore = 25;
    }

    // 2. Order Score — based on completion rate
    const totalOrders = await Order.countDocuments({ storeId });
    const completedOrders = await Order.countDocuments({ storeId, orderStatus: 'delivered' });
    const cancelledOrders = await Order.countDocuments({ storeId, orderStatus: 'cancelled' });
    let orderScore = 0;
    if (totalOrders > 0) {
        orderScore = Math.round((completedOrders / totalOrders) * 100);
    }

    // 3. Rating Score — average rating scaled to 0-100
    const reviewAgg = await Review.aggregate([
        { $match: { storeId: store?._id, isActive: true } },
        { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } }
    ]);
    const averageRating = reviewAgg.length > 0 ? reviewAgg[0].avg : 0;
    const totalReviews = reviewAgg.length > 0 ? reviewAgg[0].count : 0;
    const ratingScore = Math.round((averageRating / 5) * 100);

    // 4. Fraud Score — 100 = no fraud, reduces with reports
    const totalReports = await FraudReport.countDocuments({
        storeId,
        status: { $in: ['open', 'investigating', 'resolved'] }
    });
    const seriousReports = await FraudReport.countDocuments({
        storeId,
        severity: { $in: ['high', 'critical'] },
        status: { $ne: 'dismissed' }
    });
    // Each report reduces score by 10, serious reports by 20
    let fraudScore = Math.max(0, 100 - (totalReports * 10) - (seriousReports * 10));

    // 5. Weighted total
    const totalScore = Math.round(
        (ratingScore * 0.4) + (orderScore * 0.3) + (kycScore * 0.2) + (fraudScore * 0.1)
    );

    // 6. Badge assignment
    let badge: 'none' | 'bronze' | 'silver' | 'gold' | 'verified' = 'none';
    if (kycScore === 100 && totalScore >= 85) badge = 'verified';
    else if (totalScore >= 75) badge = 'gold';
    else if (totalScore >= 50) badge = 'silver';
    else if (totalScore >= 25) badge = 'bronze';

    // 7. Upsert trust score record
    const trustScore = await TrustScore.findOneAndUpdate(
        { sellerId, storeId },
        {
            kycScore,
            orderScore,
            ratingScore,
            fraudScore,
            totalScore,
            badge,
            totalOrders,
            completedOrders,
            cancelledOrders,
            averageRating: Math.round(averageRating * 10) / 10,
            totalReviews,
            totalReports,
            lastCalculatedAt: new Date(),
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return trustScore;
};

// Batch update all seller trust scores (called by cron)
export const updateAllTrustScores = async (): Promise<{ updated: number; errors: number }> => {
    const stores = await Store.find({ isActive: true }).select('_id ownerId');
    let updated = 0;
    let errors = 0;

    for (const store of stores) {
        try {
            await calculateTrustScore(store.ownerId.toString(), store._id.toString());
            updated++;
        } catch (e) {
            console.error(`Trust score error for store ${store._id}:`, e);
            errors++;
        }
    }

    console.log(`Trust scores updated: ${updated} success, ${errors} errors`);
    return { updated, errors };
};

// Get trust score for a store (public)
export const getStoreTrustScore = async (storeId: string) => {
    return TrustScore.findOne({ storeId }).lean();
};

// Get trust score for a seller across all stores
export const getSellerTrustScores = async (sellerId: string) => {
    return TrustScore.find({ sellerId }).lean();
};
