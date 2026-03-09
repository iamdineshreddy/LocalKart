import React, { useMemo } from 'react';
import { Product, CartItem, Category } from '../types';
import ProductCard from '../components/ui/ProductCard';
import {
    ChevronRight, Plus, ArrowRight, RefreshCw, Heart,
    ChefHat, Sparkles, Loader2, Zap
} from 'lucide-react';

interface HomePageProps {
    products: Product[];
    cart: CartItem[];
    addToCart: (product: Product) => void;
    toggleWishlist: (product: Product) => void;
    isFavorite: (productId: string) => boolean;
    setCurrentPage: (page: string) => void;
    setSelectedProduct: (product: Product | null) => void;
    setModalQuantity: (quantity: number) => void;
    setSelectedCategory: (category: Category | 'all') => void;
    recipeIdea: string;
    isRecipeLoading: boolean;
    generateRecipe: () => void;
}

const HomePage: React.FC<HomePageProps> = ({
    products, cart, addToCart, toggleWishlist, isFavorite,
    setCurrentPage, setSelectedProduct, setModalQuantity,
    setSelectedCategory, recipeIdea, isRecipeLoading, generateRecipe
}) => {
    const previousPurchases = useMemo(() => products.slice(0, 4), [products]);

    return (
        <div className="space-y-8 sm:space-y-12">
            {/* Hero Section */}
            <section className="relative px-4 sm:px-8 pt-4 sm:pt-6">
                <div className="max-w-7xl mx-auto rounded-[2.5rem] overflow-hidden relative min-h-[400px] sm:min-h-[480px] flex items-center bg-blue-950">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-950 via-blue-950/70 to-transparent z-10"></div>
                    <img
                        src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=2000"
                        className="absolute inset-0 w-full h-full object-cover object-center"
                        alt="Local Grocery Delivery"
                    />
                    <div className="relative z-20 px-6 sm:px-16 py-10 text-white max-w-2xl">
                        <div className="inline-flex items-center space-x-2 bg-blue-600/80 backdrop-blur-md text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-6 shadow-lg shadow-blue-500/10">
                            <Zap className="h-3 w-3 fill-current" />
                            <span>Free Delivery On Your First Cart</span>
                        </div>
                        <h1 className="text-4xl sm:text-7xl font-black mb-6 leading-[1.0] tracking-tight">
                            Freshness Delivered. <span className="text-blue-400 block sm:inline">Neighborhood, Simplified.</span>
                        </h1>
                        <p className="text-base sm:text-lg text-slate-300 mb-8 max-w-md font-medium leading-relaxed opacity-90">
                            Your daily essentials from local stores you trust, delivered to your door in a flash.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 items-center">
                            <button
                                onClick={() => setCurrentPage('catalog')}
                                className="w-full sm:w-auto bg-blue-600 text-white px-10 py-4 rounded-[1.2rem] font-black hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 flex items-center justify-center text-lg active:scale-95"
                            >
                                Order Now <ArrowRight className="ml-2 h-5 w-5" />
                            </button>
                            <div className="hidden sm:flex items-center gap-3 bg-white/5 backdrop-blur-sm px-4 py-3 rounded-[1rem] border border-white/10">
                                <div className="flex -space-x-2">
                                    {[1, 2, 3].map(i => <img key={i} src={`https://i.pravatar.cc/100?img=${i + 20}`} className="w-8 h-8 rounded-full border-2 border-blue-900" />)}
                                </div>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">15k+ Users Locally</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Smart Recipe Assistant */}
            <section className="max-w-7xl mx-auto px-4">
                <div className="bg-white border border-slate-100 p-6 sm:p-8 rounded-[2.5rem] shadow-sm flex flex-col md:flex-row items-center gap-6 relative overflow-hidden">
                    <div className="absolute -top-12 -right-12 w-48 h-48 bg-blue-50 rounded-full -z-10 opacity-40"></div>
                    <div className="bg-blue-900 w-16 h-16 sm:w-20 sm:h-20 rounded-[1.8rem] flex items-center justify-center flex-shrink-0 shadow-xl shadow-blue-100">
                        <ChefHat className="h-8 w-8 sm:h-10 sm:h-10 text-white" />
                    </div>
                    <div className="flex-1 text-center md:text-left">
                        <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-1">Recipe Assistant</h2>
                        <p className="text-slate-500 text-sm font-medium mb-3">AI-powered suggestions based on your current basket items.</p>
                        {recipeIdea ? (
                            <div className="bg-blue-50/50 p-4 sm:p-5 rounded-2xl border-l-4 border-blue-600 animate-in fade-in slide-in-from-left-4 duration-500">
                                <p className="text-blue-900 font-bold italic text-sm sm:text-base leading-relaxed">"{recipeIdea}"</p>
                            </div>
                        ) : (
                            <button
                                onClick={generateRecipe}
                                disabled={isRecipeLoading}
                                className="inline-flex items-center text-blue-600 font-black text-[10px] sm:text-xs uppercase tracking-widest hover:text-blue-700 transition-all gap-2 group"
                            >
                                {isRecipeLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4 group-hover:rotate-12 transition-transform" />}
                                Get Magic Suggestion
                            </button>
                        )}
                    </div>
                </div>
            </section>

            {/* Top Categories Grid */}
            <section className="max-w-7xl mx-auto px-4">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 ml-2">Shop Categories</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
                    {Object.values(Category).slice(0, 4).map((cat) => (
                        <div
                            key={cat}
                            onClick={() => { setSelectedCategory(cat); setCurrentPage('catalog'); }}
                            className="group cursor-pointer text-center"
                        >
                            <div className="aspect-[4/3] bg-slate-50 rounded-[2rem] mb-3 flex items-center justify-center overflow-hidden border border-slate-100 group-hover:border-blue-200 group-hover:shadow-xl transition-all">
                                <img src={`https://picsum.photos/seed/${cat}/400/300`} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-all duration-500" />
                            </div>
                            <span className="text-[11px] font-black text-slate-800 leading-tight block uppercase tracking-wide">{cat}</span>
                        </div>
                    ))}
                </div>
            </section>

            {/* RE-BUY / RECENTLY BOUGHT Section */}
            <section className="max-w-7xl mx-auto px-4 bg-slate-50/50 py-10 sm:py-12 rounded-[3rem] border border-slate-100/50">
                <div className="flex justify-between items-center mb-8 px-4">
                    <div>
                        <h2 className="text-2xl font-black tracking-tight flex items-center gap-3">
                            <RefreshCw className="h-6 w-6 text-blue-600" /> Buy It Again
                        </h2>
                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">Based on your recent local orders</p>
                    </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-8 px-4">
                    {previousPurchases.map((product) => (
                        <div
                            key={product.id}
                            onClick={() => { setSelectedProduct(product); setModalQuantity(1); }}
                            className="bg-white p-3 rounded-[2rem] border border-slate-100 hover:shadow-lg transition-all group cursor-pointer"
                        >
                            <div className="relative aspect-square rounded-[1.5rem] overflow-hidden bg-slate-50 mb-4">
                                <img
                                    src={product.imageUrl}
                                    onError={(e) => { e.currentTarget.src = 'https://placehold.co/400x400/f8fafc/94a3b8?text=Image+Unavailable'; }}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                />
                                <button
                                    onClick={(e) => { e.stopPropagation(); toggleWishlist(product); }}
                                    className={`absolute top-3 right-3 p-2 rounded-full transition-all ${isFavorite(product.id) ? 'bg-red-50 text-red-500' : 'bg-white/80 text-slate-400 hover:text-red-500'}`}
                                >
                                    <Heart className={`h-4 w-4 ${isFavorite(product.id) ? 'fill-current' : ''}`} />
                                </button>
                            </div>
                            <h4 className="font-bold text-sm text-slate-900 truncate px-1">{product.name}</h4>
                            <div className="flex justify-between items-center mt-3 px-1">
                                <span className="font-black text-blue-900">₹{product.price}</span>
                                <button onClick={() => addToCart(product)} className="bg-blue-50 text-blue-600 p-2 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm">
                                    <Plus className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Main Product Feed */}
            <section className="max-w-7xl mx-auto px-4 pb-20">
                <div className="flex justify-between items-end mb-10">
                    <div>
                        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Best in Market</h2>
                        <p className="text-slate-400 font-black mt-1 text-[10px] uppercase tracking-[0.2em]">Quality neighborhood picks</p>
                    </div>
                    <button onClick={() => setCurrentPage('catalog')} className="text-blue-600 font-black flex items-center hover:bg-blue-50 px-5 py-2.5 rounded-2xl text-xs uppercase tracking-widest transition-all">
                        Browse All <ChevronRight className="h-4 w-4 ml-1" />
                    </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
                    {products.slice(0, 6).map((product) => (
                        <ProductCard key={product.id} product={product} onAddToCart={() => addToCart(product)} onOpenModal={() => { setSelectedProduct(product); setModalQuantity(1); }} isFavorite={isFavorite(product.id)} onToggleFavorite={() => toggleWishlist(product)} />
                    ))}
                </div>
            </section>
        </div>
    );
};

export default HomePage;
