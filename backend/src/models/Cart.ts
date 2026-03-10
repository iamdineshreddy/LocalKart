import mongoose, { Document, Schema } from 'mongoose';

export interface ICartItem {
    productId: mongoose.Types.ObjectId;
    name: string;
    price: number;
    quantity: number;
    imageUrl?: string;
    unit: string;
}

export interface ICart extends Document {
    userId: mongoose.Types.ObjectId;
    items: ICartItem[];
    updatedAt: Date;
}

const CartItemSchema = new Schema<ICartItem>({
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    imageUrl: { type: String },
    unit: { type: String, default: 'pc' }
}, { _id: false });

const CartSchema = new Schema<ICart>({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    items: [CartItemSchema]
}, { timestamps: true });

export const Cart = mongoose.model<ICart>('Cart', CartSchema);
