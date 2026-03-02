import mongoose, { Document, Schema } from 'mongoose';

export interface IOTP extends Document {
    phone: string;
    otp: string;
    purpose: 'login' | 'register' | 'kyc' | 'password_reset';
    expiresAt: Date;
    attempts: number;
    maxAttempts: number;
    isVerified: boolean;
    verifiedAt?: Date;
    ipAddress?: string;
    userAgent?: string;
    createdAt: Date;
}

const OTPSchema = new Schema<IOTP>({
    phone: { type: String, required: true, index: true },
    otp: { type: String, required: true },
    purpose: {
        type: String,
        enum: ['login', 'register', 'kyc', 'password_reset'],
        default: 'login'
    },
    expiresAt: { type: Date, required: true },
    attempts: { type: Number, default: 0 },
    maxAttempts: { type: Number, default: 3 },
    isVerified: { type: Boolean, default: false },
    verifiedAt: { type: Date },
    ipAddress: { type: String },
    userAgent: { type: String }
}, { timestamps: true });

// Index for cleanup
OTPSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const OTP = mongoose.model<IOTP>('OTP', OTPSchema);
