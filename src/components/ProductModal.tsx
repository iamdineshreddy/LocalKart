import React from 'react';
import { X, Plus, Minus, ShoppingCart, Heart, Star, Store } from 'lucide-react';
import { Product } from '../types';

interface ProductModalProps {
  product: Product;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
  quantity: number;
  onQuantityChange: (delta: number) => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}

const ProductModal: React.FC<ProductModalProps> = ({
  product,
  onClose,
  onAddToCart,
  quantity,
  onQuantityChange,
  isFavorite,
  onToggleFavorite
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white rounded-[2.5rem] max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-white/80 backdrop-blur-md p-2 rounded-full shadow-lg hover:bg-slate-100 transition-colors"
        >
          <X className="h-5 w-5 text-slate-600" />
        </button>
        
        <div className="aspect-[16/10] overflow-hidden">
          <img 
            src={product.imageUrl} 
            alt={product.name} 
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <span className="inline-block bg-blue-100 text-blue-900 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest mb-3">
                {product.category}
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">{product.name}</h2>
            </div>
            <button 
              onClick={onToggleFavorite}
              className={`p-3 rounded-full border-2 transition-all ${isFavorite ? 'bg-red-50 border-red-200 text-red-500' : 'bg-slate-50 border-slate-100 text-slate-400 hover:text-red-500 hover:border-red-200'}`}
            >
              <Heart className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} />
            </button>
          </div>
          
          <p className="text-slate-500 font-medium leading-relaxed mb-6">{product.description}</p>
          
          <div className="flex items-center gap-4 mb-6 text-sm">
            <div className="flex items-center gap-2 text-slate-500">
              <Store className="h-4 w-4" />
              <span className="font-bold">{product.sellerName}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-500">
              <div className="flex items-center">
                {[1,2,3,4,5].map((star) => (
                  <Star key={star} className={`h-3 w-3 ${star <= 4 ? 'text-yellow-400 fill-current' : 'text-slate-300'}`} />
                ))}
              </div>
              <span className="font-bold">(42)</span>
            </div>
            <div className="text-green-600 font-bold">
              {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
            </div>
          </div>
          
          <div className="flex items-center justify-between gap-6 pt-6 border-t border-slate-100">
            <div className="flex items-center bg-slate-50 rounded-2xl p-2 border border-slate-100">
              <button 
                onClick={() => onQuantityChange(-1)}
                className="w-10 h-10 flex items-center justify-center hover:bg-white rounded-xl transition-colors text-blue-600 font-bold"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="mx-6 font-black text-lg">{quantity}</span>
              <button 
                onClick={() => onQuantityChange(1)}
                className="w-10 h-10 flex items-center justify-center hover:bg-white rounded-xl transition-colors text-blue-600 font-bold"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            
            <div className="flex items-center gap-4">
              <span className="font-black text-3xl text-slate-900">₹{product.price * quantity}</span>
              <button 
                onClick={() => { onAddToCart(product); onClose(); }}
                disabled={product.stock === 0}
                className="bg-blue-900 text-white px-8 py-4 rounded-[1.2rem] font-black hover:bg-black transition-all shadow-xl shadow-blue-500/20 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingCart className="h-5 w-5" />
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;
