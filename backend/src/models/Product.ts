import mongoose, { Document, Schema } from 'mongoose';

export interface IProduct extends Document {
    storeId: mongoose.Types.ObjectId;
    name: string;
    description: string;
    price: number;
    originalPrice?: number;
    category: string;
    subcategory?: string;
    imageUrls: string[];
    thumbnailUrl?: string;
    unit: string;
    stock: number;
    isAvailable: boolean;
    isActive: boolean;
    brand?: string;
    tags: string[];
    expiryDate?: Date;
    tagsNLP?: string[]; // Extracted tags for NLP search
    rating: number;
    totalRatings: number;
    totalSold: number;
    viewCount: number;
    searchScore?: number; // ML-based search relevance score
    priceHistory: {
        price: number;
        date: Date;
    }[];
    createdAt: Date;
    updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>({
    storeId: { type: Schema.Types.ObjectId, ref: 'Store', required: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    originalPrice: { type: Number },
    category: { type: String, required: true },
    subcategory: { type: String },
    imageUrls: [{ type: String }],
    thumbnailUrl: { type: String },
    unit: { type: String, required: true },
    stock: { type: Number, default: 0 },
    isAvailable: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true },
    brand: { type: String },
    tags: [{ type: String }],
    expiryDate: { type: Date },
    tagsNLP: [{ type: String }],
    rating: { type: Number, default: 0 },
    totalRatings: { type: Number, default: 0 },
    totalSold: { type: Number, default: 0 },
    viewCount: { type: Number, default: 0 },
    searchScore: { type: Number, default: 0 },
    priceHistory: [{
        price: { type: Number },
        date: { type: Date, default: Date.now }
    }]
}, { timestamps: true });

// Indexes for search and filtering
ProductSchema.index({ name: 'text', description: 'text', tags: 'text', tagsNLP: 'text' });
ProductSchema.index({ storeId: 1, category: 1 });
ProductSchema.index({ price: 1 });
ProductSchema.index({ rating: -1 });
ProductSchema.index({ totalSold: -1 });
ProductSchema.index({ isActive: 1, isAvailable: 1 });

// Virtual for discount percentage
ProductSchema.virtual('discountPercentage').get(function () {
    if (this.originalPrice && this.originalPrice > this.price) {
        return Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100);
    }
    return 0;
});

export const Product = mongoose.model<IProduct>('Product', ProductSchema);
