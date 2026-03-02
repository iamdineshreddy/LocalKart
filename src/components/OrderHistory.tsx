import React from 'react';
import { Package, MapPin, Clock, ChevronRight, Star, RefreshCw } from 'lucide-react';
import { CartItem } from '../types';

interface Order {
  id: string;
  items: CartItem[];
  total: number;
  date: string;
  status: 'packed' | 'shipping' | 'delivered';
  address: string;
}

interface OrderHistoryProps {
  orders: Order[];
  onReorder: (items: CartItem[]) => void;
  onNavigate: (page: string) => void;
}

const OrderHistory: React.FC<OrderHistoryProps> = ({ orders, onReorder, onNavigate }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-700';
      case 'shipping': return 'bg-blue-100 text-blue-700';
      case 'packed': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered': return <Star className="h-4 w-4" />;
      case 'shipping': return <Package className="h-4 w-4" />;
      case 'packed': return <Clock className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-10">
        <h1 className="text-3xl font-black tracking-tight">My Orders</h1>
        <button onClick={() => onNavigate('home')} className="text-blue-600 font-bold text-sm hover:underline">
          Continue Shopping
        </button>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-[3rem] border border-slate-100 shadow-sm">
          <div className="bg-slate-50 w-24 h-24 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
            <Package className="h-12 w-12 text-slate-300" />
          </div>
          <p className="text-xl font-black text-slate-900 mb-3">No orders yet</p>
          <p className="text-slate-500 font-medium mb-8">Your order history will appear here</p>
          <button 
            onClick={() => onNavigate('catalog')}
            className="bg-blue-600 text-white px-10 py-4 rounded-[1.2rem] font-black hover:bg-blue-700 transition-all"
          >
            Start Shopping
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-50">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-wider mb-1">Order #{order.id}</p>
                    <p className="font-bold text-slate-500 text-sm">{order.date}</p>
                  </div>
                  <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black uppercase ${getStatusColor(order.status)}`}>
                    {getStatusIcon(order.status)}
                    {order.status}
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex flex-wrap gap-3 mb-6">
                  {order.items.slice(0, 4).map((item, idx) => (
                    <div key={idx} className="relative w-16 h-16 rounded-xl overflow-hidden bg-slate-50">
                      <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                      {item.quantity > 1 && (
                        <span className="absolute bottom-0 right-0 bg-blue-900 text-white text-[8px] font-black px-1.5 py-0.5 rounded-tl-lg">
                          x{item.quantity}
                        </span>
                      )}
                    </div>
                  ))}
                  {order.items.length > 4 && (
                    <div className="w-16 h-16 rounded-xl bg-slate-100 flex items-center justify-center text-xs font-black text-slate-500">
                      +{order.items.length - 4}
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
                  <MapPin className="h-4 w-4" />
                  <span className="font-medium">{order.address}</span>
                </div>
                
                <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-50">
                  <div className="font-black text-xl text-slate-900">
                    Total: ₹{order.total}
                  </div>
                  <button 
                    onClick={() => onReorder(order.items)}
                    className="flex items-center gap-2 bg-blue-50 text-blue-700 px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-blue-100 transition-colors"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Buy Again
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

export default OrderHistory;
