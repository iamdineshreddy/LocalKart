import React from 'react';
import { ShoppingBag, Zap, CheckCircle } from 'lucide-react';

interface SuccessPageProps {
    orderStatus: number;
    setCurrentPage: (page: string) => void;
    setCart: (cart: any[]) => void;
}

const SuccessPage: React.FC<SuccessPageProps> = ({ orderStatus, setCurrentPage, setCart }) => (
    <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <div className="mb-12 relative">
            <div className="w-32 h-32 bg-green-100 rounded-[3rem] flex items-center justify-center mx-auto relative z-10 animate-in zoom-in-50 duration-500">
                <CheckCircle className="h-16 w-16 text-green-600" />
            </div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-green-50 rounded-full animate-pulse blur-2xl"></div>
        </div>
        <h1 className="text-4xl font-black mb-4 tracking-tight">Order Success!</h1>
        <p className="text-slate-500 font-bold mb-12">Your neighborhood store is packing your basket right now.</p>

        <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl space-y-8 mb-12 relative overflow-hidden">
            <div className="flex justify-between items-center relative">
                <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-100 -translate-y-1/2 -z-10"></div>
                <div className={`absolute top-1/2 left-0 h-1 bg-blue-600 -translate-y-1/2 -z-10 transition-all duration-1000 ${orderStatus >= 2 ? 'w-1/2' : 'w-0'} ${orderStatus === 3 ? 'w-full' : ''}`}></div>

                <div className="flex flex-col items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 ${orderStatus >= 1 ? 'bg-blue-600 border-blue-100 text-white' : 'bg-white border-slate-100'}`}>
                        <ShoppingBag className="h-4 w-4" />
                    </div>
                    <p className="text-[10px] font-black uppercase text-slate-400">Packed</p>
                </div>
                <div className="flex flex-col items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 ${orderStatus >= 2 ? 'bg-blue-600 border-blue-100 text-white' : 'bg-white border-slate-100'}`}>
                        <Zap className="h-4 w-4" />
                    </div>
                    <p className="text-[10px] font-black uppercase text-slate-400">Shipping</p>
                </div>
                <div className="flex flex-col items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 ${orderStatus === 3 ? 'bg-blue-600 border-blue-100 text-white' : 'bg-white border-slate-100'}`}>
                        <CheckCircle className="h-4 w-4" />
                    </div>
                    <p className="text-[10px] font-black uppercase text-slate-400">Delivered</p>
                </div>
            </div>
        </div>

        <button onClick={() => { setCart([]); setCurrentPage('home'); }} className="text-blue-600 font-black text-sm uppercase tracking-widest hover:underline">
            Back to LocalKart Home
        </button>
    </div>
);

export default SuccessPage;
