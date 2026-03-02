import React from 'react';
import { CartItem } from '../types';
import { ShoppingBag, Plus, Minus, Trash2 } from 'lucide-react';

interface CartPageProps {
    cart: CartItem[];
    totalAmount: number;
    removeFromCart: (productId: string) => void;
    updateQuantity: (productId: string, delta: number) => void;
    setCurrentPage: (page: string) => void;
}

const CartPage: React.FC<CartPageProps> = ({
    cart, totalAmount, removeFromCart, updateQuantity, setCurrentPage
}) => (
    <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-12">
            <h1 className="text-4xl font-black tracking-tight">Basket</h1>
            <div className="flex items-center gap-3">
                <span className="bg-slate-100 text-slate-600 px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-widest">{cart.length} Items</span>
            </div>
        </div>

        {cart.length === 0 ? (
            <div className="text-center py-24 bg-white rounded-[3rem] border border-slate-100 shadow-sm">
                <div className="bg-blue-50 w-32 h-32 rounded-[2.5rem] flex items-center justify-center mx-auto mb-10">
                    <ShoppingBag className="h-16 w-16 text-blue-200" />
                </div>
                <p className="text-2xl font-black text-slate-900 mb-4">Your basket is empty</p>
                <p className="text-slate-400 mb-10 max-w-xs mx-auto font-medium">Add some items from local stores and get delivered in minutes.</p>
                <button
                    onClick={() => setCurrentPage('catalog')}
                    className="bg-blue-600 text-white px-12 py-5 rounded-[1.2rem] font-black hover:bg-blue-700 transition-all shadow-2xl shadow-blue-500/20 active:scale-95"
                >
                    Go Shopping
                </button>
            </div>
        ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                <div className="lg:col-span-2 space-y-4">
                    {cart.map((item) => (
                        <div key={item.id} className="bg-white p-6 rounded-[2rem] flex items-center border border-slate-100 shadow-sm hover:shadow-md transition-all">
                            <img src={item.imageUrl} className="w-24 h-24 object-cover rounded-[1.5rem]" alt={item.name} />
                            <div className="ml-6 flex-1">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-extrabold text-slate-900 leading-tight text-lg">{item.name}</h3>
                                        <p className="text-[11px] text-slate-400 font-black uppercase mt-1 tracking-wider">{item.unit}</p>
                                    </div>
                                    <button onClick={() => removeFromCart(item.id)} className="text-slate-300 hover:text-red-500 transition-colors p-2"><Trash2 className="h-5 w-5" /></button>
                                </div>
                                <div className="mt-4 flex justify-between items-center">
                                    <div className="flex items-center bg-slate-50 rounded-2xl p-1.5 border border-slate-100">
                                        <button onClick={() => updateQuantity(item.id, -1)} className="w-8 h-8 flex items-center justify-center hover:bg-white rounded-xl transition-colors text-blue-600 font-bold"><Minus className="h-3 w-3" /></button>
                                        <span className="mx-4 font-black text-sm">{item.quantity}</span>
                                        <button onClick={() => updateQuantity(item.id, 1)} className="w-8 h-8 flex items-center justify-center hover:bg-white rounded-xl transition-colors text-blue-600 font-bold"><Plus className="h-3 w-3" /></button>
                                    </div>
                                    <span className="font-black text-slate-900 text-lg">₹{item.price * item.quantity}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="lg:col-span-1">
                    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl sticky top-24">
                        <h2 className="text-xl font-black mb-8 border-b border-slate-50 pb-4 text-blue-900">Cart Total</h2>
                        <div className="space-y-4 mb-10 text-sm font-bold">
                            <div className="flex justify-between text-slate-500">
                                <span>Items</span>
                                <span>₹{totalAmount}</span>
                            </div>
                            <div className="flex justify-between text-slate-500">
                                <span>Delivery</span>
                                <div className="flex items-center"><span className="line-through text-slate-300 mr-2">₹165</span><span className="text-green-600 font-black">FREE</span></div>
                            </div>
                            <div className="pt-6 flex justify-between font-black text-2xl text-slate-900 border-t border-slate-50">
                                <span>Total Pay</span>
                                <span>₹{totalAmount}</span>
                            </div>
                        </div>
                        <button
                            onClick={() => setCurrentPage('checkout')}
                            className="w-full bg-blue-900 text-white py-5 rounded-[1.2rem] font-black hover:bg-black transition-all shadow-xl shadow-blue-500/20 active:scale-95"
                        >
                            Proceed to Pay
                        </button>
                    </div>
                </div>
            </div>
        )}
    </div>
);

export default CartPage;
