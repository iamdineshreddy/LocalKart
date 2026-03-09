import React from 'react';
import { Product } from '../../types';
import { Heart, Plus } from 'lucide-react';

interface ProductCardProps {
    product: Product;
    onAddToCart: () => void;
    onOpenModal: () => void;
    isFavorite: boolean;
    onToggleFavorite: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart, onOpenModal, isFavorite, onToggleFavorite }) => (
    <div className="bg-white rounded-[2rem] overflow-hidden border border-slate-100 hover:shadow-2xl hover:shadow-blue-500/5 transition-all group flex flex-col p-2 h-full cursor-pointer" onClick={onOpenModal}>
        <div className="relative aspect-square rounded-[1.5rem] overflow-hidden bg-slate-50">
            <img
                src={product.imageUrl}
                alt={product.name}
                onError={(e) => { e.currentTarget.src = 'https://placehold.co/400x400/f8fafc/94a3b8?text=Image+Unavailable'; }}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
            />
            <div className="absolute top-3 left-3">
                <span className="bg-white/90 backdrop-blur-md text-slate-900 px-2.5 py-1 rounded-xl text-[8px] font-black uppercase tracking-widest shadow-sm">
                    {product.category.split(' & ')[0]}
                </span>
            </div>
            <button
                onClick={(e) => { e.stopPropagation(); onToggleFavorite(); }}
                className={`absolute top-3 right-3 p-2 rounded-full transition-all ${isFavorite ? 'bg-red-50 text-red-500' : 'bg-white/80 text-slate-400 hover:text-red-500'}`}
            >
                <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
            </button>
        </div>
        <div className="p-4 flex-grow flex flex-col">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{product.unit}</p>
            <h3 className="font-extrabold text-sm text-slate-900 leading-tight mb-4 line-clamp-2 h-9">
                {product.name}
            </h3>
            <div className="mt-auto flex items-center justify-between">
                <span className="font-black text-lg text-slate-900">₹{product.price}</span>
                <button
                    onClick={(e) => { e.stopPropagation(); onAddToCart(); }}
                    className="bg-blue-600 text-white px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/10 active:scale-95"
                >
                    Add
                </button>
            </div>
        </div>
    </div>
);

export default ProductCard;
