import React, { useState } from 'react';
import { Product, Category, User } from '../types';
import { Store } from 'lucide-react';

interface SellerDashboardProps {
    products: Product[];
    user: User | null;
    setProducts: (products: Product[]) => void;
    onNavigate: (page: string) => void;
}

const SellerDashboard: React.FC<SellerDashboardProps> = ({ products, user, setProducts, onNavigate }) => {
    const [newItem, setNewItem] = useState({ name: '', price: '', category: Category.FRUITS_VEGGIES, keywords: '', description: '' });

    const handleAddItem = (e: React.FormEvent) => {
        e.preventDefault();
        const product: Product = {
            id: Math.random().toString(36).substr(2, 9),
            name: newItem.name,
            description: newItem.description,
            price: parseFloat(newItem.price),
            category: newItem.category,
            imageUrl: `https://picsum.photos/seed/${newItem.name}/800/600`,
            sellerId: user?.id || 's1',
            sellerName: user?.name || 'Local Seller',
            unit: 'ea',
            stock: 100
        };
        setProducts([product, ...products]);
        alert('Listed successfully on LocalKart!');
        onNavigate('catalog');
    };

    if (!user || user.role !== 'seller') {
        return (
            <div className="max-w-md mx-auto py-32 text-center px-4">
                <Store className="h-20 w-20 text-blue-100 mx-auto mb-8" />
                <h2 className="text-2xl font-black mb-4 tracking-tight">Partner Portal</h2>
                <button onClick={() => onNavigate('login')} className="bg-blue-900 text-white px-10 py-4.5 rounded-[1.2rem] font-black shadow-2xl active:scale-95 transition-all">Sign In</button>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-12">
            <h1 className="text-4xl font-black tracking-tight mb-12">Add New Item</h1>
            <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl max-w-4xl">
                <form onSubmit={handleAddItem} className="space-y-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                        <input required value={newItem.name} onChange={e => setNewItem({ ...newItem, name: e.target.value })} placeholder="Title" className="w-full p-4.5 bg-slate-50 border border-slate-100 rounded-[1.2rem] outline-none font-bold" />
                        <select value={newItem.category} onChange={e => setNewItem({ ...newItem, category: e.target.value as Category })} className="w-full p-4.5 bg-slate-50 border border-slate-100 rounded-[1.2rem] outline-none font-bold">
                            {Object.values(Category).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                        <input required type="number" step="0.01" value={newItem.price} onChange={e => setNewItem({ ...newItem, price: e.target.value })} placeholder="Price" className="w-full p-4.5 bg-slate-50 border border-slate-100 rounded-[1.2rem] outline-none font-bold" />
                    </div>
                    <textarea required rows={4} value={newItem.description} onChange={e => setNewItem({ ...newItem, description: e.target.value })} placeholder="Description" className="w-full p-4.5 bg-slate-50 border border-slate-100 rounded-[1.2rem] outline-none resize-none font-bold"></textarea>
                    <button type="submit" className="w-full bg-blue-900 text-white py-6 rounded-[2rem] font-black text-xl hover:bg-black transition-all shadow-2xl active:scale-95">List Item</button>
                </form>
            </div>
        </div>
    );
};

export default SellerDashboard;
