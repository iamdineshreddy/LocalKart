import React from 'react';
import { ShoppingCart, User, Store, Search, LogOut, MapPin, Menu, Heart } from 'lucide-react';
import { User as UserType } from '../types';

interface NavbarProps {
  onNavigate: (page: string) => void;
  cartCount: number;
  user: UserType | null;
  onLogout: () => void;
  onMenuClick?: () => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ onNavigate, cartCount, user, onLogout, onMenuClick, searchQuery = '', onSearchChange }) => {
  return (
    <nav className="bg-white border-b border-slate-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 sm:h-20 items-center gap-4">
          <div className="flex items-center sm:gap-8">
            <div 
              className="flex items-center cursor-pointer group"
              onClick={() => onNavigate('home')}
            >
              <span className="text-xl sm:text-2xl brand-font text-blue-900 tracking-tighter">Local<span className="text-blue-600">Kart</span></span>
            </div>

            <div className="hidden lg:flex items-center text-sm border-l border-slate-100 pl-6 cursor-pointer hover:opacity-80 transition-opacity">
              <MapPin className="h-4 w-4 text-blue-600 mr-2 flex-shrink-0" />
              <div className="truncate max-w-[150px]">
                <p className="font-extrabold text-slate-900 leading-tight">Instant Delivery</p>
                <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider truncate">Downtown, 5th Avenue</p>
              </div>
            </div>
          </div>

          <div className="flex-1 max-w-xl hidden md:block">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange?.(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && onNavigate('catalog')}
                className="block w-full pl-11 pr-4 py-2.5 border border-slate-200 rounded-2xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 focus:bg-white sm:text-sm transition-all shadow-sm"
                placeholder="Search for chips, milk, essentials..."
              />
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <button 
              onClick={() => onNavigate('wishlist')}
              className="hidden sm:flex items-center p-2 text-slate-600 hover:text-blue-900 font-bold text-xs uppercase tracking-wider transition-colors"
            >
              <Heart className="h-5 w-5" />
            </button>
            
            <button 
              onClick={() => onNavigate('seller-dashboard')}
              className="hidden sm:flex items-center space-x-1.5 text-slate-600 hover:text-blue-900 font-bold text-xs uppercase tracking-wider transition-colors"
            >
              <Store className="h-4 w-4" />
              <span>Partner Log</span>
            </button>

            <button 
              onClick={() => onNavigate('cart')}
              className="relative bg-blue-900 text-white px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl flex items-center space-x-2 hover:bg-blue-800 transition-all shadow-lg shadow-blue-200"
            >
              <ShoppingCart className="h-5 w-5" />
              <span className="font-extrabold hidden sm:inline">Basket</span>
              {cartCount > 0 && (
                <span className="bg-white text-blue-900 px-1.5 py-0.5 rounded-lg text-[10px] font-black min-w-[20px] text-center">
                  {cartCount}
                </span>
              )}
            </button>

            {user ? (
              <button 
                onClick={onLogout}
                className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                title="Logout"
              >
                <LogOut className="h-5 w-5" />
              </button>
            ) : (
              <button 
                onClick={() => onNavigate('login')}
                className="font-extrabold text-slate-700 hover:text-blue-600 transition-colors hidden sm:block"
              >
                Sign In
              </button>
            )}
            
            <button onClick={onMenuClick} className="md:hidden p-2 text-slate-600">
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
      <div className="md:hidden px-4 pb-4">
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange?.(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onNavigate('catalog')}
            className="block w-full pl-11 pr-4 py-2 border border-slate-100 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-600/10 focus:bg-white text-sm"
            placeholder="Search for anything..."
          />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
