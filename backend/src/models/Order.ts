import mongoose, { Document, Schema } from 'mongoose';

export interface IOrderItem {
    productId: mongoose.Types.ObjectId;
    storeId: mongoose.Types.ObjectId;
    productName: string;
    productImage: string;
    quantity: number;
    unit: string;
    price: number;
    total: number;
}

export interface IDeliveryPartner {
    partnerId: mongoose.Types.ObjectId;
    name: string;
    phone: string;
    currentLocation?: {
        type: 'Point';
        coordinates: [number, number];
    };
}

export interface IOrder extends Document {
    orderNumber: string;
    userId: mongoose.Types.ObjectId;
    items: IOrderItem[];
    storeId: mongoose.Types.ObjectId;
    deliveryAddress: {
        label: string;
        fullAddress: string;
        city: string;
        state: string;
        pincode: string;
        location: {
            type: 'Point';
            coordinates: [number, number];
        };
        landmark?: string;
    };
    subtotal: number;
    deliveryFee: number;
    discount: number;
    tax: number;
    total: number;
    paymentMethod: 'cod' | 'online' | 'wallet';
    paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
    paymentId?: string;
    orderStatus: 'placed' | 'confirmed' | 'preparing' | 'ready' | 'picked_up' | 'on_the_way' | 'delivered' | 'cancelled';
    deliveryPartner?: IDeliveryPartner;
    estimatedDeliveryTime?: Date;
    actualDeliveryTime?: Date;
    statusHistory: {
        status: string;
        timestamp: Date;
        note?: string;
    }[];
    cancelledAt?: Date;
    cancellationReason?: string;
    rating?: number;
    review?: string;
    createdAt: Date;
    updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>({
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    storeId: { type: Schema.Types.ObjectId, ref: 'Store', required: true },
    productName: { type: String, required: true },
    productImage: { type: String },
    quantity: { type: Number, required: true },
    unit: { type: String, required: true },
    price: { type: Number, required: true },
    total: { type: Number, required: true }
}, { _id: false });

const DeliveryPartnerSchema = new Schema<IDeliveryPartner>({
    partnerId: { type: Schema.Types.ObjectId, ref: 'User' },
    name: { type: String },
    phone: { type: String },
    currentLocation: {
        type: { type: String, enum: ['Point'] },
        coordinates: [Number]
    }
}, { _id: false });

const StatusHistorySchema = new Schema({
    status: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    note: { type: String }
}, { _id: false });

const OrderSchema = new Schema<IOrder>({
    orderNumber: { type: String, required: true, unique: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    items: [OrderItemSchema],
    storeId: { type: Schema.Types.ObjectId, ref: 'Store', required: true },
    deliveryAddress: {
        label: { type: String },
        fullAddress: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        pincode: { type: String, required: true },
        location: {
            type: { type: String, enum: ['Point'], required: true },
            coordinates: { type: [Number], required: true }
        },
        landmark: { type: String }
    },
    subtotal: { type: Number, required: true },
    deliveryFee: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    total: { type: Number, required: true },
    paymentMethod: {
        type: String,
        enum: ['cod', 'online', 'wallet'],
        default: 'cod'
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed', 'refunded'],
        default: 'pending'
    },
    paymentId: { type: String },
    orderStatus: {
        type: String,
        enum: ['placed', 'confirmed', 'preparing', 'ready', 'picked_up', 'on_the_way', 'delivered', 'cancelled'],
        default: 'placed'
    },
    deliveryPartner: DeliveryPartnerSchema,
    estimatedDeliveryTime: { type: Date },
    actualDeliveryTime: { type: Date },
    statusHistory: [StatusHistorySchema],
    cancelledAt: { type: Date },
    cancellationReason: { type: String },
    rating: { type: Number, min: 1, max: 5 },
    review: { type: String }
}, { timestamps: true });

// Indexes
OrderSchema.index({ orderNumber: 1 });
OrderSchema.index({ userId: 1, createdAt: -1 });
OrderSchema.index({ storeId: 1, createdAt: -1 });
OrderSchema.index({ orderStatus: 1 });
OrderSchema.index({ 'deliveryAddress.location': '2dsphere' });

export const Order = mongoose.model<IOrder>('Order', OrderSchema);
