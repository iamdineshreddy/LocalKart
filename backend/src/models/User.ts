import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IAddress extends Document {
    label: string;
    fullAddress: string;
    city: string;
    state: string;
    pincode: string;
    location: {
        type: 'Point';
        coordinates: [number, number]; // [longitude, latitude]
    };
    isDefault: boolean;
    landmark?: string;
}

export interface IKYCVerification extends Document {
    userId?: mongoose.Types.ObjectId;
    status: 'not_started' | 'pending' | 'submitted' | 'verified' | 'rejected';
    aadhaarNumber?: string;
    aadhaarVerified: boolean;
    panNumber?: string;
    panVerified: boolean;
    digilockerLinked: boolean;
    digilockerAccessToken?: string;
    documentsSubmitted: boolean;
    submittedAt?: Date;
    verifiedAt?: Date;
    rejectionReason?: string;
    aadhaarDocUrl?: string;
    panDocUrl?: string;
}

export interface IUser extends Document {
    name: string;
    email: string;
    phone: string;
    password: string;
    role: 'buyer' | 'seller' | 'delivery_partner' | 'admin';
    profileImage?: string;
    isVerified: boolean;
    isActive: boolean;
    addresses: IAddress[];
    defaultAddress?: mongoose.Types.ObjectId;
    kyc: IKYCVerification;
    location?: {
        type: 'Point';
        coordinates: [number, number];
    };
    fcmToken?: string;
    createdAt: Date;
    updatedAt: Date;
    comparePassword(candidatePassword: string): Promise<boolean>;
}

const AddressSchema = new Schema<IAddress>({
    label: { type: String, required: true },
    fullAddress: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    location: {
        type: { type: String, enum: ['Point'], required: true },
        coordinates: { type: [Number], required: true }
    },
    isDefault: { type: Boolean, default: false },
    landmark: { type: String }
});

const KYCSchema = new Schema<IKYCVerification>({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: false },
    status: {
        type: String,
        enum: ['not_started', 'pending', 'submitted', 'verified', 'rejected'],
        default: 'not_started'
    },
    aadhaarNumber: { type: String },
    aadhaarVerified: { type: Boolean, default: false },
    panNumber: { type: String },
    panVerified: { type: Boolean, default: false },
    digilockerLinked: { type: Boolean, default: false },
    digilockerAccessToken: { type: String },
    documentsSubmitted: { type: Boolean, default: false },
    submittedAt: { type: Date },
    verifiedAt: { type: Date },
    rejectionReason: { type: String },
    aadhaarDocUrl: { type: String },
    panDocUrl: { type: String }
});

const UserSchema = new Schema<IUser>({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    phone: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false },
    role: {
        type: String,
        enum: ['buyer', 'seller', 'delivery_partner', 'admin'],
        default: 'buyer'
    },
    profileImage: { type: String },
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    addresses: [AddressSchema],
    defaultAddress: { type: Schema.Types.ObjectId, ref: 'Address' },
    kyc: { type: KYCSchema, default: () => ({}) },
    location: {
        type: { type: String, enum: ['Point'] },
        coordinates: [Number]
    },
    fcmToken: { type: String }
}, { timestamps: true });

// Index for geospatial queries
UserSchema.index({ location: '2dsphere' });
UserSchema.index({ 'addresses.location': '2dsphere' });

// Hash password before saving
UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Compare password method
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model<IUser>('User', UserSchema);
export const Address = mongoose.model<IAddress>('Address', AddressSchema);
export const KYCVerification = mongoose.model<IKYCVerification>('KYCVerification', KYCSchema);
