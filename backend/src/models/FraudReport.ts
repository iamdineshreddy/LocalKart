import mongoose, { Document, Schema } from 'mongoose';

// FraudReport model — buyer reports against sellers
export interface IFraudReport extends Document {
    reporterId: mongoose.Types.ObjectId;   // User who filed report
    sellerId: mongoose.Types.ObjectId;     // Reported seller
    storeId: mongoose.Types.ObjectId;
    orderId?: mongoose.Types.ObjectId;     // Optional linked order
    type: 'fake_product' | 'scam' | 'harassment' | 'counterfeit' | 'non_delivery' | 'other';
    description: string;
    evidence?: string[];                   // image URLs as proof
    status: 'open' | 'investigating' | 'resolved' | 'dismissed';
    severity: 'low' | 'medium' | 'high' | 'critical';
    adminNotes?: string;
    actionTaken?: 'none' | 'warning' | 'suspension' | 'ban';
    resolvedAt?: Date;
    resolvedBy?: mongoose.Types.ObjectId;  // Admin who resolved
    createdAt: Date;
    updatedAt: Date;
}

const FraudReportSchema = new Schema<IFraudReport>({
    reporterId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    sellerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    storeId: { type: Schema.Types.ObjectId, ref: 'Store', required: true },
    orderId: { type: Schema.Types.ObjectId, ref: 'Order' },
    type: {
        type: String,
        enum: ['fake_product', 'scam', 'harassment', 'counterfeit', 'non_delivery', 'other'],
        required: true
    },
    description: { type: String, required: true, maxlength: 2000 },
    evidence: [{ type: String }],
    status: {
        type: String,
        enum: ['open', 'investigating', 'resolved', 'dismissed'],
        default: 'open'
    },
    severity: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        default: 'medium'
    },
    adminNotes: { type: String },
    actionTaken: {
        type: String,
        enum: ['none', 'warning', 'suspension', 'ban'],
        default: 'none'
    },
    resolvedAt: { type: Date },
    resolvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

// Indexes for admin queries
FraudReportSchema.index({ status: 1, createdAt: -1 });
FraudReportSchema.index({ sellerId: 1 });
FraudReportSchema.index({ storeId: 1 });
FraudReportSchema.index({ reporterId: 1 });

export const FraudReport = mongoose.model<IFraudReport>('FraudReport', FraudReportSchema);
