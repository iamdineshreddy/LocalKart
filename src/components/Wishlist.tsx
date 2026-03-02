import React from 'react';
import { Heart, Trash2, ShoppingCart, ArrowRight } from 'lucide-react';
import { Product } from '../types';

interface WishlistProps {
  items: Product[];
  onRemoveFromWishlist: (productId: string) => void;
  onAddToCart: (product: Product) => void;
  onNavigate: (page: string) => void;
}

const Wishlist: React.FC<WishlistProps> = ({ items, onRemoveFromWishlist, onAddToCart, onNavigate }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-10">
        <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
          <Heart className="h-8 w-8 text-red-500 fill-current" />
          My Wishlist
        </h1>
        <button onClick={() => onNavigate('catalog')} className="text-blue-600 font-bold text-sm hover:underline">
          Continue Shopping
        </button>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-[3rem] border border-slate-100 shadow-sm">
          <div className="bg-red-50 w-24 h-24 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
            <Heart className="h-12 w-12 text-red-300" />
          </div>
          <p className="text-xl font-black text-slate-900 mb-3">Your wishlist is empty</p>
          <p className="text-slate-500 font-medium mb-8">Save items you love for later</p>
          <button 
            onClick={() => onNavigate('catalog')}
            className="bg-blue-600 text-white px-10 py-4 rounded-[1.2rem] font-black hover:bg-blue-700 transition-all inline-flex items-center gap-2"
          >
            Browse Products <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((product) => (
            <div key={product.id} className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden group">
              <div className="relative aspect-square overflow-hidden bg-slate-50">
                <img 
                  src={product.imageUrl} 
                  alt={product.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <button 
                  onClick={() => onRemoveFromWishlist(product.id)}
                  className="absolute top-3 right-3 bg-white p-2 rounded-full shadow-lg text-red-500 hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                <div className="absolute bottom-3 left-3">
                  <span className="bg-white/90 backdrop-blur-md text-slate-900 px-2.5 py-1 rounded-xl text-[8px] font-black uppercase tracking-widest shadow-sm">
                    {product.category}
                  </span>
                </div>
              </div>
              
              <div className="p-5">
                <h3 className="font-extrabold text-sm text-slate-900 leading-tight mb-2 line-clamp-2 h-10">
                  {product.name}
                </h3>
                <p className="text-xs text-slate-500 font-medium mb-4">{product.unit}</p>
                
                <div className="flex items-center justify-between">
                  <span className="font-black text-xl text-slate-900">₹{product.price}</span>
                  <button 
                    onClick={() => onAddToCart(product)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all flex items-center gap-2"
                  >
                    <ShoppingCart className="h-3 w-3" />
                    Add
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
