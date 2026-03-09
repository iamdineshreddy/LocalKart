import mongoose, { Document, Schema } from 'mongoose';

// Review model — tracks buyer reviews on products and stores
export interface IReview extends Document {
    userId: mongoose.Types.ObjectId;
    productId: mongoose.Types.ObjectId;
    storeId: mongoose.Types.ObjectId;
    orderId?: mongoose.Types.ObjectId;
    rating: number;            // 1-5 stars
    title?: string;
    text: string;
    isVerifiedPurchase: boolean; // true if linked to a completed order
    images?: string[];          // optional review images
    helpfulCount: number;       // "was this helpful?" votes
    isActive: boolean;          // admin can hide inappropriate reviews
    createdAt: Date;
    updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    storeId: { type: Schema.Types.ObjectId, ref: 'Store', required: true },
    orderId: { type: Schema.Types.ObjectId, ref: 'Order' },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, maxlength: 150 },
    text: { type: String, required: true, maxlength: 1000 },
    isVerifiedPurchase: { type: Boolean, default: false },
    images: [{ type: String }],
    helpfulCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });

// Indexes for fast lookups
ReviewSchema.index({ productId: 1, createdAt: -1 });
ReviewSchema.index({ storeId: 1, createdAt: -1 });
ReviewSchema.index({ userId: 1 });
ReviewSchema.index({ orderId: 1 });

// Prevent duplicate reviews per user-product pair
ReviewSchema.index({ userId: 1, productId: 1 }, { unique: true });

export const Review = mongoose.model<IReview>('Review', ReviewSchema);
