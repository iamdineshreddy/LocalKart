import mongoose, { Document, Schema } from 'mongoose';

export interface IStore extends Document {
    ownerId: mongoose.Types.ObjectId;
    storeName: string;
    description?: string;
    logo?: string;
    banner?: string;
    phone: string;
    email?: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    location: {
        type: 'Point';
        coordinates: [number, number];
    };
    rating: number;
    totalRatings: number;
    isVerified: boolean;
    isActive: boolean;
    isOpen: boolean;
    openingTime: string;
    closingTime: string;
    deliveryRadius: number; // in km
    minimumOrder: number;
    deliveryFee: number;
    freeDeliveryAbove: number;
    categories: string[];
    tags: string[];
    gstin?: string;
    aadhaarNumber?: string;
    panNumber?: string;
    kycStatus: 'not_started' | 'pending' | 'submitted' | 'verified' | 'rejected';
    createdAt: Date;
    updatedAt: Date;
}

const StoreSchema = new Schema<IStore>({
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    storeName: { type: String, required: true },
    description: { type: String },
    logo: { type: String },
    banner: { type: String },
    phone: { type: String, required: true },
    email: { type: String, lowercase: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    location: {
        type: { type: String, enum: ['Point'], required: true },
        coordinates: { type: [Number], required: true }
    },
    rating: { type: Number, default: 0 },
    totalRatings: { type: Number, default: 0 },
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    isOpen: { type: Boolean, default: true },
    openingTime: { type: String, default: '08:00' },
    closingTime: { type: String, default: '22:00' },
    deliveryRadius: { type: Number, default: 5 }, // km
    minimumOrder: { type: Number, default: 100 },
    deliveryFee: { type: Number, default: 20 },
    freeDeliveryAbove: { type: Number, default: 500 },
    categories: [{ type: String }],
    tags: [{ type: String }],
    gstin: { type: String },
    aadhaarNumber: { type: String },
    panNumber: { type: String },
    kycStatus: {
        type: String,
        enum: ['not_started', 'pending', 'submitted', 'verified', 'rejected'],
        default: 'not_started'
    }
}, { timestamps: true });

// Geospatial index for finding nearby stores
StoreSchema.index({ location: '2dsphere' });
StoreSchema.index({ city: 1 });
StoreSchema.index({ categories: 1 });
StoreSchema.index({ isActive: 1, isOpen: 1 });

export const Store = mongoose.model<IStore>('Store', StoreSchema);
