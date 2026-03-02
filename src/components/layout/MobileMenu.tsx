import React from 'react';
import { X, Home, ShoppingBag, User, Heart, Store, LogOut, MapPin } from 'lucide-react';
import { User as UserType } from '../types';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (page: string) => void;
  user: UserType | null;
  onLogout: () => void;
  cartCount: number;
}

const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, onClose, onNavigate, user, onLogout, cartCount }) => {
  if (!isOpen) return null;

  const menuItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'catalog', label: 'Shop', icon: ShoppingBag },
    { id: 'cart', label: `Cart (${cartCount})`, icon: ShoppingBag },
    { id: 'orders', label: 'Orders', icon: Store },
    { id: 'wishlist', label: 'Wishlist', icon: Heart },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
      <div className="absolute top-0 right-0 h-full w-80 bg-white shadow-2xl animate-in slide-in-from-right duration-300">
        <div className="p-6">
          <div className="flex justify-between items-center mb-8">
            <span className="text-2xl brand-font text-blue-900 tracking-tighter">Local<span className="text-blue-600">Kart</span></span>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
              <X className="h-6 w-6 text-slate-600" />
            </button>
          </div>

          <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-2xl mb-6">
            <div className="w-10 h-10 bg-blue-900 rounded-full flex items-center justify-center text-white">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <p className="font-bold text-sm text-slate-900">Instant Delivery</p>
              <p className="text-xs text-slate-500">Downtown, 5th Avenue</p>
            </div>
          </div>

          <nav className="space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => { onNavigate(item.id); onClose(); }}
                className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-all font-bold text-sm"
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </button>
            ))}
          </nav>

          <div className="mt-8 pt-6 border-t border-slate-100">
            {user ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 px-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-slate-900">{user.name}</p>
                    <p className="text-xs text-slate-500">{user.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => { onLogout(); onClose(); }}
                  className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-red-600 hover:bg-red-50 transition-all font-bold text-sm"
                >
                  <LogOut className="h-5 w-5" />
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={() => { onNavigate('login'); onClose(); }}
                className="w-full bg-blue-900 text-white py-4 rounded-2xl font-bold hover:bg-black transition-colors"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileMenu;
