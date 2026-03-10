import mongoose, { Document, Schema } from 'mongoose';

export interface IWishlistItem {
    productId: mongoose.Types.ObjectId;
    addedAt: Date;
}

export interface IWishlist extends Document {
    userId: mongoose.Types.ObjectId;
    items: IWishlistItem[];
}

const WishlistItemSchema = new Schema<IWishlistItem>({
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    addedAt: { type: Date, default: Date.now }
}, { _id: false });

const WishlistSchema = new Schema<IWishlist>({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    items: [WishlistItemSchema]
}, { timestamps: true });

export const Wishlist = mongoose.model<IWishlist>('Wishlist', WishlistSchema);
