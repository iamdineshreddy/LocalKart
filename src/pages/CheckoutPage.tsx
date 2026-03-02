import React from 'react';
import { CartItem, Address, User } from '../types';
import { ArrowLeft, CreditCard, Banknote, Truck, Loader2 } from 'lucide-react';

interface CheckoutPageProps {
    cart: CartItem[];
    totalAmount: number;
    user: User | null;
    addresses: Address[];
    paymentMethod: 'online' | 'cod';
    setPaymentMethod: (method: 'online' | 'cod') => void;
    isProcessingPayment: boolean;
    handleOrder: () => void;
    setCurrentPage: (page: string) => void;
}

const CheckoutPage: React.FC<CheckoutPageProps> = ({
    cart, totalAmount, user, addresses, paymentMethod, setPaymentMethod,
    isProcessingPayment, handleOrder, setCurrentPage
}) => (
    <div className="max-w-3xl mx-auto px-4 py-12">
        <button onClick={() => setCurrentPage('cart')} className="flex items-center text-slate-400 font-bold hover:text-blue-600 mb-10 transition-colors text-xs uppercase tracking-widest">
            <ArrowLeft className="h-4 w-4 mr-2" /> Cart Review
        </button>
        <h1 className="text-3xl font-black mb-10 tracking-tight">Finalizing Order</h1>

        <div className="bg-white p-8 sm:p-10 rounded-[3rem] border border-slate-100 shadow-2xl space-y-10">
            {/* Step 1: Address */}
            <div className="space-y-6">
                <h2 className="text-lg font-black flex items-center">
                    <span className="bg-blue-100 text-blue-900 w-10 h-10 rounded-[1rem] inline-flex items-center justify-center mr-4 text-xs font-black">01</span>
                    Delivery Address
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input
                        defaultValue={user?.name || ''}
                        placeholder="Full Name"
                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 outline-none font-bold transition-all"
                    />
                    <input
                        defaultValue={user?.phone || ''}
                        placeholder="Phone"
                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 outline-none font-bold transition-all"
                    />
                    <input
                        defaultValue={addresses.find(a => a.isDefault)?.fullAddress || addresses[0]?.fullAddress}
                        placeholder="Delivery Address"
                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 outline-none font-bold transition-all sm:col-span-2"
                    />
                </div>
            </div>

            {/* Step 2: Payment Method */}
            <div className="space-y-6">
                <h2 className="text-lg font-black flex items-center">
                    <span className="bg-blue-100 text-blue-900 w-10 h-10 rounded-[1rem] inline-flex items-center justify-center mr-4 text-xs font-black">02</span>
                    Payment Method
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Online Payment */}
                    <button
                        type="button"
                        onClick={() => setPaymentMethod('online')}
                        className={`relative p-5 rounded-2xl border-2 text-left transition-all duration-300 ${paymentMethod === 'online'
                            ? 'border-blue-500 bg-blue-50/60 shadow-lg shadow-blue-500/10'
                            : 'border-slate-100 bg-white hover:border-slate-200 hover:shadow-sm'
                            }`}
                    >
                        <div className="flex items-start gap-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${paymentMethod === 'online' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'
                                }`}>
                                <CreditCard className="h-5 w-5" />
                            </div>
                            <div className="flex-1">
                                <p className={`font-black text-sm ${paymentMethod === 'online' ? 'text-blue-900' : 'text-slate-700'
                                    }`}>Pay Online</p>
                                <p className="text-xs text-slate-400 font-medium mt-0.5">
                                    UPI, Cards, Netbanking, Wallets
                                </p>
                            </div>
                        </div>
                        <div className={`absolute top-4 right-4 w-5 h-5 rounded-full border-2 transition-all duration-300 flex items-center justify-center ${paymentMethod === 'online' ? 'border-blue-600 bg-blue-600' : 'border-slate-200'
                            }`}>
                            {paymentMethod === 'online' && (
                                <div className="w-2 h-2 bg-white rounded-full" />
                            )}
                        </div>
                    </button>

                    {/* Cash on Delivery */}
                    <button
                        type="button"
                        onClick={() => setPaymentMethod('cod')}
                        className={`relative p-5 rounded-2xl border-2 text-left transition-all duration-300 ${paymentMethod === 'cod'
                            ? 'border-green-500 bg-green-50/60 shadow-lg shadow-green-500/10'
                            : 'border-slate-100 bg-white hover:border-slate-200 hover:shadow-sm'
                            }`}
                    >
                        <div className="flex items-start gap-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${paymentMethod === 'cod' ? 'bg-green-600 text-white' : 'bg-slate-100 text-slate-400'
                                }`}>
                                <Banknote className="h-5 w-5" />
                            </div>
                            <div className="flex-1">
                                <p className={`font-black text-sm ${paymentMethod === 'cod' ? 'text-green-900' : 'text-slate-700'
                                    }`}>Cash on Delivery</p>
                                <p className="text-xs text-slate-400 font-medium mt-0.5">
                                    Pay when your order arrives
                                </p>
                            </div>
                        </div>
                        <div className={`absolute top-4 right-4 w-5 h-5 rounded-full border-2 transition-all duration-300 flex items-center justify-center ${paymentMethod === 'cod' ? 'border-green-600 bg-green-600' : 'border-slate-200'
                            }`}>
                            {paymentMethod === 'cod' && (
                                <div className="w-2 h-2 bg-white rounded-full" />
                            )}
                        </div>
                    </button>
                </div>
            </div>

            {/* Order Summary */}
            <div className="border-t border-slate-100 pt-8 space-y-3">
                <div className="flex justify-between text-sm font-bold text-slate-500">
                    <span>Items ({cart.length})</span>
                    <span>₹{totalAmount}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-slate-500">
                    <span>Delivery</span>
                    <span className="text-green-600 font-black">FREE</span>
                </div>
                {paymentMethod === 'cod' && (
                    <div className="flex justify-between text-sm font-bold text-slate-500">
                        <span>COD Fee</span>
                        <span className="text-green-600 font-black">FREE</span>
                    </div>
                )}
                <div className="flex justify-between font-black text-xl text-slate-900 pt-4 border-t border-slate-50">
                    <span>Total</span>
                    <span>₹{totalAmount}</span>
                </div>
            </div>

            {/* Place Order Button */}
            <button
                onClick={handleOrder}
                disabled={isProcessingPayment}
                className={`w-full py-6 rounded-[2rem] font-black text-xl transition-all shadow-2xl active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-3 ${paymentMethod === 'online'
                    ? 'bg-blue-900 text-white hover:bg-blue-950 shadow-blue-500/20'
                    : 'bg-green-700 text-white hover:bg-green-800 shadow-green-500/20'
                    }`}
            >
                {isProcessingPayment ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                ) : paymentMethod === 'online' ? (
                    <>
                        <CreditCard className="h-5 w-5" />
                        Pay ₹{totalAmount}
                    </>
                ) : (
                    <>
                        <Truck className="h-5 w-5" />
                        Place Order • ₹{totalAmount}
                    </>
                )}
            </button>

            {/* Test mode hint */}
            {paymentMethod === 'online' && (
                <p className="text-center text-slate-400 text-xs font-medium">
                    🔒 Secured by Razorpay • Test mode: use card 4111 1111 1111 1111
                </p>
            )}
        </div>
    </div>
);

export default CheckoutPage;
