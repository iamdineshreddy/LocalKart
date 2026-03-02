
import React from 'react';
import { Instagram, Twitter, Facebook, PlayCircle, AppWindow, Mail, Phone, MapPin } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-50 border-t border-slate-100 mt-20">
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
          <div className="col-span-1 lg:col-span-1">
            <span className="text-2xl brand-font text-blue-900 tracking-tighter">Local<span className="text-blue-600">Kart</span></span>
            <p className="mt-6 text-slate-500 text-sm leading-relaxed font-medium">
              Bringing your favorite local stores online. Every daily essential, delivered with care from your neighborhood.
            </p>
            <div className="flex space-x-5 mt-8">
              <Instagram className="h-5 w-5 text-slate-400 hover:text-blue-600 cursor-pointer transition-colors" />
              <Twitter className="h-5 w-5 text-slate-400 hover:text-blue-600 cursor-pointer transition-colors" />
              <Facebook className="h-5 w-5 text-slate-400 hover:text-blue-600 cursor-pointer transition-colors" />
            </div>
          </div>

          <div>
            <h3 className="text-[10px] font-black text-slate-400 tracking-widest uppercase mb-6">Quick Links</h3>
            <ul className="space-y-4">
              <li><a href="#" className="text-slate-600 hover:text-blue-600 text-sm font-bold transition-colors">Shop All</a></li>
              <li><a href="#" className="text-slate-600 hover:text-blue-600 text-sm font-bold transition-colors">Bulk Orders</a></li>
              <li><a href="#" className="text-slate-600 hover:text-blue-600 text-sm font-bold transition-colors">Become a Partner</a></li>
              <li><a href="#" className="text-slate-600 hover:text-blue-600 text-sm font-bold transition-colors">Fleet Network</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-[10px] font-black text-slate-400 tracking-widest uppercase mb-6">Support</h3>
            <ul className="space-y-4">
              <li className="flex items-center text-slate-600 text-sm font-bold">
                <Mail className="h-4 w-4 mr-3 text-blue-600" /> hello@localcart.in
              </li>
              <li className="flex items-center text-slate-600 text-sm font-bold">
                <Phone className="h-4 w-4 mr-3 text-blue-600" /> +917893380832
              </li>
              <li className="flex items-center text-slate-600 text-sm font-bold">
                <MapPin className="h-4 w-4 mr-3 text-blue-600" /> Local Hub, Suite 404
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-[10px] font-black text-slate-400 tracking-widest uppercase mb-6">Mobile Apps</h3>
            <div className="space-y-3">
              <button className="flex items-center bg-slate-900 text-white px-5 py-2.5 rounded-2xl w-full hover:bg-black transition-colors">
                <PlayCircle className="h-5 w-5 mr-3" />
                <div className="text-left">
                  <p className="text-[8px] uppercase leading-none opacity-60">Get on</p>
                  <p className="text-xs font-black">Google Play</p>
                </div>
              </button>
              <button className="flex items-center bg-slate-900 text-white px-5 py-2.5 rounded-2xl w-full hover:bg-black transition-colors">
                <AppWindow className="h-5 w-5 mr-3" />
                <div className="text-left">
                  <p className="text-[8px] uppercase leading-none opacity-60">Available on</p>
                  <p className="text-xs font-black">App Store</p>
                </div>
              </button>
            </div>
          </div>
        </div>
        <div className="mt-16 pt-8 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center text-[10px] text-slate-400 font-bold tracking-wider uppercase">
          <p>© 2026 LocalKart Technologies. Supporting Local Business.</p>
          <div className="flex space-x-8 mt-4 md:mt-0">
            <a href="#" className="hover:text-blue-600">Privacy Policy</a>
            <a href="#" className="hover:text-blue-600">Terms of Use</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
