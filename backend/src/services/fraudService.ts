import { Store } from '../models/Store';
import { Order } from '../models/Order';
import { Review } from '../models/Review';
import { FraudReport } from '../models/FraudReport';
import { User } from '../models/User';

/**
 * Fraud Detection Service
 *
 * Detects suspicious seller activity:
 *  - High refund/cancellation rate (>30%)
 *  - Multiple complaints in short period
 *  - Abnormal order volume spikes
 *  - Suspiciously identical reviews (fake reviews)
 *
 * Actions: warn, suspend, or ban seller
 */

interface FraudRisk {
    sellerId: string;
    storeId: string;
    storeName: string;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    flags: string[];
    cancellationRate: number;
    reportCount: number;
    suspiciousReviewCount: number;
}

// Analyze a single seller for fraud risks
export const analyzeSeller = async (sellerId: string, storeId: string): Promise<FraudRisk> => {
    const store = await Store.findById(storeId);
    const flags: string[] = [];

    // 1. High cancellation rate
    const totalOrders = await Order.countDocuments({ storeId });
    const cancelledOrders = await Order.countDocuments({ storeId, orderStatus: 'cancelled' });
    const cancellationRate = totalOrders > 0 ? (cancelledOrders / totalOrders) * 100 : 0;
    if (cancellationRate > 50) flags.push('CRITICAL: Cancellation rate > 50%');
    else if (cancellationRate > 30) flags.push('HIGH: Cancellation rate > 30%');

    // 2. Multiple fraud reports
    const reportCount = await FraudReport.countDocuments({
        storeId,
        status: { $ne: 'dismissed' },
        createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // last 30 days
    });
    if (reportCount >= 5) flags.push('CRITICAL: 5+ fraud reports in 30 days');
    else if (reportCount >= 3) flags.push('HIGH: 3+ fraud reports in 30 days');
    else if (reportCount >= 1) flags.push('MEDIUM: Recent fraud report');

    // 3. Suspicious review patterns (many 5-star reviews in short time)
    const recentReviews = await Review.find({
        storeId,
        createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // last 7 days
    }).select('rating userId text');

    let suspiciousReviewCount = 0;
    // Check for duplicate review text (possible fake reviews)
    const reviewTexts = recentReviews.map(r => r.text?.toLowerCase().trim());
    const textSet = new Set(reviewTexts);
    if (reviewTexts.length > 0 && textSet.size < reviewTexts.length * 0.7) {
        suspiciousReviewCount = reviewTexts.length - textSet.size;
        flags.push(`MEDIUM: ${suspiciousReviewCount} potentially duplicate reviews`);
    }

    // 4. Abnormal order volume spike (3x average daily)
    const thirtyDayOrders = await Order.countDocuments({
        storeId,
        createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    });
    const avgDaily = thirtyDayOrders / 30;
    const todayOrders = await Order.countDocuments({
        storeId,
        createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
    });
    if (avgDaily > 0 && todayOrders > avgDaily * 3) {
        flags.push(`MEDIUM: Abnormal order spike (${todayOrders} today vs ${Math.round(avgDaily)} avg/day)`);
    }

    // Determine overall risk level
    let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
    if (flags.some(f => f.startsWith('CRITICAL'))) riskLevel = 'critical';
    else if (flags.some(f => f.startsWith('HIGH'))) riskLevel = 'high';
    else if (flags.some(f => f.startsWith('MEDIUM'))) riskLevel = 'medium';

    return {
        sellerId,
        storeId,
        storeName: store?.storeName || 'Unknown',
        riskLevel,
        flags,
        cancellationRate: Math.round(cancellationRate * 10) / 10,
        reportCount,
        suspiciousReviewCount,
    };
};

// Scan all active sellers for fraud risks (called by cron)
export const scanAllSellersForFraud = async (): Promise<FraudRisk[]> => {
    const stores = await Store.find({ isActive: true }).select('_id ownerId storeName');
    const riskyStores: FraudRisk[] = [];

    for (const store of stores) {
        try {
            const risk = await analyzeSeller(store.ownerId.toString(), store._id.toString());
            if (risk.riskLevel !== 'low') {
                riskyStores.push(risk);
            }
        } catch (e) {
            console.error(`Fraud scan error for store ${store._id}:`, e);
        }
    }

    console.log(`Fraud scan complete: ${riskyStores.length} risky sellers found`);
    return riskyStores;
};

// Take action on a seller: warn, suspend, or ban
export const takeActionOnSeller = async (
    storeId: string,
    action: 'warning' | 'suspension' | 'ban',
    adminId: string,
    reason: string
): Promise<{ success: boolean; message: string }> => {
    const store = await Store.findById(storeId);
    if (!store) return { success: false, message: 'Store not found' };

    switch (action) {
        case 'warning':
            // Just log the warning — store stays active
            break;
        case 'suspension':
            store.isActive = false;
            await store.save();
            break;
        case 'ban':
            store.isActive = false;
            store.isVerified = false;
            await store.save();
            // Also deactivate seller user
            await User.findByIdAndUpdate(store.ownerId, { isActive: false });
            break;
    }

    return { success: true, message: `Seller ${action} applied successfully` };
};
