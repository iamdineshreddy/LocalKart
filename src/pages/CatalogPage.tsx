import React from 'react';
import { Product, Category } from '../types';
import ProductCard from '../components/ui/ProductCard';
import { Search } from 'lucide-react';

interface CatalogPageProps {
    products: Product[];
    filteredProducts: Product[];
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    selectedCategory: Category | 'all';
    setSelectedCategory: (category: Category | 'all') => void;
    addToCart: (product: Product) => void;
    isFavorite: (productId: string) => boolean;
    toggleWishlist: (product: Product) => void;
    setSelectedProduct: (product: Product | null) => void;
    setModalQuantity: (quantity: number) => void;
}

const CatalogPage: React.FC<CatalogPageProps> = ({
    products, filteredProducts, searchQuery, setSearchQuery,
    selectedCategory, setSelectedCategory, addToCart,
    isFavorite, toggleWishlist, setSelectedProduct, setModalQuantity
}) => (
    <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row gap-12">
            <div className="w-full md:w-64 space-y-12">
                {/* Search */}
                <div className="bg-white p-6 rounded-[2rem] border border-slate-100">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search products..."
                            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 focus:bg-white text-sm font-bold transition-all"
                        />
                    </div>
                </div>

                {/* Categories */}
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-8">Categories</h3>
                    <div className="space-y-3">
                        <button
                            onClick={() => setSelectedCategory('all')}
                            className={`w-full text-left py-2.5 px-4 rounded-xl text-sm font-extrabold transition-all flex items-center justify-between ${selectedCategory === 'all' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
                        >
                            All Products <span className="text-xs opacity-60">{products.length}</span>
                        </button>
                        {Object.values(Category).map((cat) => {
                            const count = products.filter(p => p.category === cat).length;
                            return (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`w-full text-left py-2.5 px-4 rounded-xl text-sm font-extrabold transition-all flex items-center justify-between ${selectedCategory === cat ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
                                >
                                    {cat} <span className="text-xs opacity-60">{count}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className="flex-1">
                <div className="flex items-center justify-between mb-10">
                    <h2 className="text-3xl font-black text-slate-900">
                        {selectedCategory === 'all' ? 'All Products' : selectedCategory}
                    </h2>
                    <span className="text-slate-400 font-bold text-sm">{filteredProducts.length} items</span>
                </div>

                {filteredProducts.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-[2.5rem] border border-slate-100">
                        <Search className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                        <p className="text-xl font-black text-slate-900 mb-2">No products found</p>
                        <p className="text-slate-500 font-medium">Try adjusting your search or filters</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                        {filteredProducts.map((product) => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                onAddToCart={() => addToCart(product)}
                                onOpenModal={() => { setSelectedProduct(product); setModalQuantity(1); }}
                                isFavorite={isFavorite(product.id)}
                                onToggleFavorite={() => toggleWishlist(product)}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    </div>
);

export default CatalogPage;
