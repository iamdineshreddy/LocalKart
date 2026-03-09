import mongoose, { Document, Schema } from 'mongoose';

// TrustScore model — computed seller reliability metric
// Updated via cron job or triggered after reviews/orders/reports
export interface ITrustScore extends Document {
    sellerId: mongoose.Types.ObjectId;   // User with role=seller
    storeId: mongoose.Types.ObjectId;
    kycScore: number;       // 0-100: based on KYC verification status
    orderScore: number;     // 0-100: order completion rate
    ratingScore: number;    // 0-100: average buyer rating scaled
    fraudScore: number;     // 0-100: penalty from fraud reports (lower = more fraud)
    totalScore: number;     // weighted composite: 0-100
    badge: 'none' | 'bronze' | 'silver' | 'gold' | 'verified';
    totalOrders: number;
    completedOrders: number;
    cancelledOrders: number;
    averageRating: number;
    totalReviews: number;
    totalReports: number;
    lastCalculatedAt: Date;
    createdAt: Date;
    updatedAt: Date;
}

const TrustScoreSchema = new Schema<ITrustScore>({
    sellerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    storeId: { type: Schema.Types.ObjectId, ref: 'Store', required: true },
    kycScore: { type: Number, default: 0, min: 0, max: 100 },
    orderScore: { type: Number, default: 0, min: 0, max: 100 },
    ratingScore: { type: Number, default: 0, min: 0, max: 100 },
    fraudScore: { type: Number, default: 100, min: 0, max: 100 }, // starts at 100 (no fraud)
    totalScore: { type: Number, default: 0, min: 0, max: 100 },
    badge: {
        type: String,
        enum: ['none', 'bronze', 'silver', 'gold', 'verified'],
        default: 'none'
    },
    totalOrders: { type: Number, default: 0 },
    completedOrders: { type: Number, default: 0 },
    cancelledOrders: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
    totalReports: { type: Number, default: 0 },
    lastCalculatedAt: { type: Date, default: Date.now },
}, { timestamps: true });

// One trust score per seller-store
TrustScoreSchema.index({ sellerId: 1, storeId: 1 }, { unique: true });
TrustScoreSchema.index({ totalScore: -1 });

export const TrustScore = mongoose.model<ITrustScore>('TrustScore', TrustScoreSchema);
