import React, { useState, useEffect } from 'react';
import {
    Shield, Users, Package, BarChart3, CheckCircle2, XCircle,
    Loader2, Eye, EyeOff, Store, AlertTriangle, LogIn, Lock, Mail
} from 'lucide-react';
import { User as UserType } from '../types';
import api from '../services/api';

interface AdminPanelProps {
    user: UserType | null;
    onLogin: (user: UserType) => void;
}

interface DashboardStats {
    totalUsers: number;
    totalSellers: number;
    totalStores: number;
    totalProducts: number;
    activeProducts: number;
    inactiveProducts: number;
    pendingSellers: number;
    verifiedStores: number;
    rejectedStores: number;
}

interface SellerItem {
    storeId: string;
    storeName: string;
    description: string;
    phone: string;
    email: string;
    address: string;
    city: string;
    state: string;
    kycStatus: string;
    isActive: boolean;
    isVerified: boolean;
    categories: string[];
    gstin: string;
    owner: { name: string; email: string; phone: string };
    createdAt: string;
}

interface ProductItem {
    id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    stock: number;
    isActive: boolean;
    isAvailable: boolean;
    imageUrl: string;
    store: { storeName: string; city: string };
    totalSold: number;
    rating: number;
    createdAt: string;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ user, onLogin }) => {
    const [activeTab, setActiveTab] = useState<'dashboard' | 'sellers' | 'products'>('dashboard');
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [sellers, setSellers] = useState<SellerItem[]>([]);
    const [products, setProducts] = useState<ProductItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [sellerFilter, setSellerFilter] = useState('all');
    const [productFilter, setProductFilter] = useState('all');
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    // Admin login state
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [loginError, setLoginError] = useState('');
    const [loginLoading, setLoginLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const isAdmin = user?.role === 'admin';

    const handleAdminLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoginError('');
        setLoginLoading(true);
        try {
            const data = await api.adminLogin(loginEmail, loginPassword);
            if (data.success && data.user) {
                onLogin({
                    id: data.user.id || data.user._id,
                    name: data.user.name,
                    email: data.user.email,
                    role: data.user.role,
                    phone: data.user.phone,
                    isVerified: data.user.isVerified,
                });
            }
        } catch (err: any) {
            setLoginError(err.message || 'Invalid admin credentials');
        }
        setLoginLoading(false);
    };

    useEffect(() => {
        if (!isAdmin) return;
        if (activeTab === 'dashboard') fetchDashboard();
        else if (activeTab === 'sellers') fetchSellers();
        else if (activeTab === 'products') fetchProducts();
    }, [activeTab, isAdmin, sellerFilter, productFilter]);

    const fetchDashboard = async () => {
        setLoading(true);
        try {
            const data = await api.getDashboardStats();
            if (data.success) setStats(data.stats);
        } catch { }
        setLoading(false);
    };

    const fetchSellers = async () => {
        setLoading(true);
        try {
            const data = await api.getAdminSellers(1, 50, sellerFilter);
            if (data.success) setSellers(data.sellers);
        } catch { }
        setLoading(false);
    };

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const data = await api.getAdminProducts(1, 50, productFilter);
            if (data.success) setProducts(data.products);
        } catch { }
        setLoading(false);
    };

    const handleApproveSeller = async (storeId: string) => {
        setActionLoading(storeId);
        try {
            await api.approveSeller(storeId);
            fetchSellers();
        } catch { }
        setActionLoading(null);
    };

    const handleRejectSeller = async (storeId: string) => {
        setActionLoading(storeId);
        try {
            await api.rejectSeller(storeId);
            fetchSellers();
        } catch { }
        setActionLoading(null);
    };

    const handleToggleProduct = async (productId: string, currentActive: boolean) => {
        setActionLoading(productId);
        try {
            await api.toggleProduct(productId, !currentActive);
            fetchProducts();
        } catch { }
        setActionLoading(null);
    };

    // --- Login Screen ---
    if (!isAdmin) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center px-4">
                <div className="w-full max-w-md">
                    <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/60 p-8 sm:p-10 border border-slate-100">
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-200">
                                <Shield className="h-8 w-8 text-white" />
                            </div>
                            <h1 className="text-2xl font-black text-slate-900">Admin Access</h1>
                            <p className="text-slate-500 text-sm font-medium mt-1">Sign in with your admin credentials</p>
                        </div>

                        <form onSubmit={handleAdminLogin} className="space-y-5">
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <input
                                        type="email"
                                        value={loginEmail}
                                        onChange={(e) => setLoginEmail(e.target.value)}
                                        className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-sm font-bold transition-all"
                                        placeholder="admin@localkart.com"
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={loginPassword}
                                        onChange={(e) => setLoginPassword(e.target.value)}
                                        className="w-full pl-11 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-sm font-bold transition-all"
                                        placeholder="••••••••"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>

                            {loginError && (
                                <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-xl text-sm font-bold">
                                    <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                                    {loginError}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loginLoading}
                                className="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white py-4 rounded-xl font-black text-sm hover:from-amber-600 hover:to-orange-700 transition-all shadow-lg shadow-amber-200 flex items-center justify-center gap-2 disabled:opacity-60"
                            >
                                {loginLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
                                {loginLoading ? 'Signing in...' : 'Sign In as Admin'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        );
    }

    // --- Admin Dashboard ---
    const tabs = [
        { id: 'dashboard' as const, label: 'Dashboard', icon: BarChart3 },
        { id: 'sellers' as const, label: 'Sellers', icon: Store },
        { id: 'products' as const, label: 'Products', icon: Package },
    ];

    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            verified: 'bg-green-100 text-green-800',
            pending: 'bg-yellow-100 text-yellow-800',
            submitted: 'bg-blue-100 text-blue-800',
            rejected: 'bg-red-100 text-red-800',
            not_started: 'bg-slate-100 text-slate-600',
        };
        return (
            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${styles[status] || styles.not_started}`}>
                {status.replace('_', ' ')}
            </span>
        );
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-amber-200">
                            <Shield className="h-5 w-5 text-white" />
                        </div>
                        Admin Panel
                    </h1>
                    <p className="text-slate-500 text-sm font-medium mt-1">Manage sellers, products, and platform operations</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-8 bg-slate-100 p-1.5 rounded-2xl w-fit">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-extrabold transition-all ${activeTab === tab.id
                                ? 'bg-white text-slate-900 shadow-sm'
                                : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        <tab.icon className="h-4 w-4" />
                        {tab.label}
                    </button>
                ))}
            </div>

            {loading && (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
                </div>
            )}

            {/* Dashboard Tab */}
            {!loading && activeTab === 'dashboard' && stats && (
                <div className="space-y-8">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                        {[
                            { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'from-blue-500 to-blue-600', shadow: 'shadow-blue-200' },
                            { label: 'Total Sellers', value: stats.totalSellers, icon: Store, color: 'from-purple-500 to-purple-600', shadow: 'shadow-purple-200' },
                            { label: 'Products', value: stats.totalProducts, icon: Package, color: 'from-green-500 to-green-600', shadow: 'shadow-green-200' },
                            { label: 'Pending Approvals', value: stats.pendingSellers, icon: AlertTriangle, color: 'from-amber-500 to-orange-600', shadow: 'shadow-amber-200' },
                        ].map((card, i) => (
                            <div key={i} className="bg-white rounded-[2rem] border border-slate-100 p-6 hover:shadow-lg transition-all">
                                <div className={`w-12 h-12 bg-gradient-to-br ${card.color} rounded-xl flex items-center justify-center mb-4 shadow-lg ${card.shadow}`}>
                                    <card.icon className="h-6 w-6 text-white" />
                                </div>
                                <p className="text-3xl font-black text-slate-900">{card.value}</p>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">{card.label}</p>
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white rounded-[2rem] border border-slate-100 p-6">
                            <h3 className="font-black text-sm text-slate-900 mb-4">Store Status</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-slate-600 font-bold">Verified</span>
                                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-lg text-xs font-black">{stats.verifiedStores}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-slate-600 font-bold">Pending</span>
                                    <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-lg text-xs font-black">{stats.pendingSellers}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-slate-600 font-bold">Rejected</span>
                                    <span className="bg-red-100 text-red-800 px-3 py-1 rounded-lg text-xs font-black">{stats.rejectedStores}</span>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-[2rem] border border-slate-100 p-6">
                            <h3 className="font-black text-sm text-slate-900 mb-4">Product Status</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-slate-600 font-bold">Active</span>
                                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-lg text-xs font-black">{stats.activeProducts}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-slate-600 font-bold">Inactive</span>
                                    <span className="bg-red-100 text-red-800 px-3 py-1 rounded-lg text-xs font-black">{stats.inactiveProducts}</span>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-[2rem] border border-slate-100 p-6">
                            <h3 className="font-black text-sm text-slate-900 mb-4">Platform</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-slate-600 font-bold">Total Stores</span>
                                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-lg text-xs font-black">{stats.totalStores}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-slate-600 font-bold">Sellers</span>
                                    <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-lg text-xs font-black">{stats.totalSellers}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Sellers Tab */}
            {!loading && activeTab === 'sellers' && (
                <div className="space-y-6">
                    <div className="flex flex-wrap gap-2">
                        {['all', 'pending', 'submitted', 'verified', 'rejected'].map(f => (
                            <button
                                key={f}
                                onClick={() => setSellerFilter(f)}
                                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${sellerFilter === f
                                        ? 'bg-amber-500 text-white shadow-lg shadow-amber-200'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    }`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>

                    {sellers.length === 0 ? (
                        <div className="text-center py-16 bg-white rounded-[2.5rem] border border-slate-100">
                            <Store className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                            <p className="text-xl font-black text-slate-900 mb-2">No sellers found</p>
                            <p className="text-slate-500 font-medium">No sellers match the current filter</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {sellers.map(seller => (
                                <div key={seller.storeId} className="bg-white rounded-2xl border border-slate-100 p-5 hover:shadow-md transition-all">
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="font-black text-slate-900 text-lg truncate">{seller.storeName}</h3>
                                                {getStatusBadge(seller.kycStatus)}
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-slate-500 font-medium">
                                                <span>👤 {seller.owner?.name || 'N/A'}</span>
                                                <span>📞 {seller.phone}</span>
                                                <span>📍 {seller.city}, {seller.state}</span>
                                            </div>
                                            {seller.gstin && (
                                                <p className="text-xs text-slate-400 font-bold mt-1">GSTIN: {seller.gstin}</p>
                                            )}
                                        </div>
                                        <div className="flex gap-2 flex-shrink-0">
                                            {seller.kycStatus !== 'verified' && (
                                                <button
                                                    onClick={() => handleApproveSeller(seller.storeId)}
                                                    disabled={actionLoading === seller.storeId}
                                                    className="flex items-center gap-1.5 px-4 py-2 bg-green-50 text-green-700 rounded-xl text-xs font-black hover:bg-green-100 transition-all disabled:opacity-50"
                                                >
                                                    {actionLoading === seller.storeId ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                                                    Approve
                                                </button>
                                            )}
                                            {seller.kycStatus !== 'rejected' && (
                                                <button
                                                    onClick={() => handleRejectSeller(seller.storeId)}
                                                    disabled={actionLoading === seller.storeId}
                                                    className="flex items-center gap-1.5 px-4 py-2 bg-red-50 text-red-700 rounded-xl text-xs font-black hover:bg-red-100 transition-all disabled:opacity-50"
                                                >
                                                    {actionLoading === seller.storeId ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <XCircle className="h-3.5 w-3.5" />}
                                                    Reject
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Products Tab */}
            {!loading && activeTab === 'products' && (
                <div className="space-y-6">
                    <div className="flex flex-wrap gap-2">
                        {['all', 'active', 'inactive'].map(f => (
                            <button
                                key={f}
                                onClick={() => setProductFilter(f)}
                                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${productFilter === f
                                        ? 'bg-amber-500 text-white shadow-lg shadow-amber-200'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    }`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>

                    {products.length === 0 ? (
                        <div className="text-center py-16 bg-white rounded-[2.5rem] border border-slate-100">
                            <Package className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                            <p className="text-xl font-black text-slate-900 mb-2">No products found</p>
                            <p className="text-slate-500 font-medium">No products match the current filter</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {products.map(product => (
                                <div key={product.id} className="bg-white rounded-2xl border border-slate-100 p-5 hover:shadow-md transition-all">
                                    <div className="flex gap-4">
                                        {product.imageUrl && (
                                            <img
                                                src={product.imageUrl}
                                                alt={product.name}
                                                className="w-16 h-16 rounded-xl object-cover flex-shrink-0 bg-slate-100"
                                                onError={(e: any) => { e.target.style.display = 'none'; }}
                                            />
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-black text-slate-900 truncate">{product.name}</h3>
                                                <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black ${product.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                    {product.isActive ? 'ACTIVE' : 'INACTIVE'}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-4 text-sm text-slate-500 font-medium">
                                                <span>₹{product.price}</span>
                                                <span>{product.category}</span>
                                                <span>Stock: {product.stock}</span>
                                            </div>
                                            <p className="text-xs text-slate-400 font-bold mt-1">
                                                🏪 {product.store?.storeName || 'Unknown'} • {product.store?.city || ''}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => handleToggleProduct(product.id, product.isActive)}
                                            disabled={actionLoading === product.id}
                                            className={`flex-shrink-0 h-fit flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black transition-all disabled:opacity-50 ${product.isActive
                                                    ? 'bg-red-50 text-red-700 hover:bg-red-100'
                                                    : 'bg-green-50 text-green-700 hover:bg-green-100'
                                                }`}
                                        >
                                            {actionLoading === product.id ? (
                                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                            ) : product.isActive ? (
                                                <EyeOff className="h-3.5 w-3.5" />
                                            ) : (
                                                <Eye className="h-3.5 w-3.5" />
                                            )}
                                            {product.isActive ? 'Disable' : 'Enable'}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AdminPanel;
