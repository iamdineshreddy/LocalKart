import React, { useState, useEffect } from 'react';
import { Package, ShoppingCart, DollarSign, BarChart3, Warehouse, UserCircle, Plus, ChevronRight, AlertTriangle, CheckCircle, Clock, XCircle, RefreshCw, Edit2 } from 'lucide-react';
import api from '../services/api';

interface SellerDashboardProps {
    products?: any[];
    user?: any;
    setProducts?: (products: any[]) => void;
    onNavigate?: (page: string) => void;
}

type SellerTab = 'overview' | 'add-product' | 'my-products' | 'orders' | 'earnings' | 'inventory' | 'profile';

const CATEGORIES = ['Groceries', 'Fruits & Vegetables', 'Snacks', 'Dairy Products', 'Household Items', 'Beverages', 'Bakery', 'Instant Food'];

const statusColors: Record<string, string> = {
    approved: '#4caf50', pending: '#ff9800', rejected: '#f44336',
    placed: '#2196f3', confirmed: '#3f51b5', preparing: '#ff9800',
    ready: '#009688', picked_up: '#673ab7', on_the_way: '#e91e63',
    delivered: '#4caf50', cancelled: '#f44336',
};

const SellerDashboard: React.FC<SellerDashboardProps> = ({ user, onNavigate }) => {
    const [activeTab, setActiveTab] = useState<SellerTab>('overview');
    const [dashboardData, setDashboardData] = useState<any>(null);
    const [products, setProducts] = useState<any[]>([]);
    const [orders, setOrders] = useState<any[]>([]);
    const [earnings, setEarnings] = useState<any>(null);
    const [inventory, setInventory] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [newProduct, setNewProduct] = useState({
        name: '', description: '', price: '', originalPrice: '', category: CATEGORIES[0],
        unit: 'kg', stock: '', brand: '', tags: '', imageUrls: ['']
    });

    useEffect(() => {
        if (activeTab === 'overview') loadDashboard();
        else if (activeTab === 'my-products') loadProducts();
        else if (activeTab === 'orders') loadOrders();
        else if (activeTab === 'earnings') loadEarnings();
        else if (activeTab === 'inventory') loadInventory();
    }, [activeTab]);

    const loadDashboard = async () => { try { setLoading(true); const data = await api.getSellerDashboard(); setDashboardData(data.dashboard); } catch (e: any) { setMessage(e.message); } finally { setLoading(false); } };
    const loadProducts = async () => { try { setLoading(true); const data = await api.getMyProducts(); setProducts(data.products || []); } catch (e: any) { setMessage(e.message); } finally { setLoading(false); } };
    const loadOrders = async () => { try { setLoading(true); const data = await api.getSellerOrders(); setOrders(data.orders || []); } catch (e: any) { setMessage(e.message); } finally { setLoading(false); } };
    const loadEarnings = async () => { try { setLoading(true); const data = await api.getSellerEarnings(); setEarnings(data.earnings); } catch (e: any) { setMessage(e.message); } finally { setLoading(false); } };
    const loadInventory = async () => { try { setLoading(true); const data = await api.getSellerInventory(); setInventory(data.inventory); } catch (e: any) { setMessage(e.message); } finally { setLoading(false); } };

    const handleAddProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setLoading(true);
            await api.createProduct({
                ...newProduct,
                price: Number(newProduct.price),
                originalPrice: newProduct.originalPrice ? Number(newProduct.originalPrice) : undefined,
                stock: Number(newProduct.stock),
                tags: newProduct.tags.split(',').map(t => t.trim()).filter(Boolean),
                imageUrls: newProduct.imageUrls.filter(Boolean),
            });
            setMessage('Product submitted for approval!');
            setNewProduct({ name: '', description: '', price: '', originalPrice: '', category: CATEGORIES[0], unit: 'kg', stock: '', brand: '', tags: '', imageUrls: [''] });
            setActiveTab('my-products');
        } catch (e: any) { setMessage(e.message); } finally { setLoading(false); }
    };

    const handleUpdateStatus = async (orderId: string, status: string) => {
        try {
            await api.updateOrderStatus(orderId, status);
            setMessage(`Order updated to ${status}`);
            loadOrders();
        } catch (e: any) { setMessage(e.message); }
    };

    const handleUpdateStock = async (productId: string, stock: number) => {
        try {
            await api.updateProductStock(productId, stock);
            setMessage('Stock updated');
            loadInventory();
        } catch (e: any) { setMessage(e.message); }
    };

    const tabs: { key: SellerTab; label: string; icon: React.ReactNode }[] = [
        { key: 'overview', label: 'Overview', icon: <BarChart3 size={18} /> },
        { key: 'add-product', label: 'Add Product', icon: <Plus size={18} /> },
        { key: 'my-products', label: 'My Products', icon: <Package size={18} /> },
        { key: 'orders', label: 'Orders', icon: <ShoppingCart size={18} /> },
        { key: 'earnings', label: 'Earnings', icon: <DollarSign size={18} /> },
        { key: 'inventory', label: 'Inventory', icon: <Warehouse size={18} /> },
        { key: 'profile', label: 'Profile', icon: <UserCircle size={18} /> },
    ];

    const nextStatus: Record<string, string[]> = {
        placed: ['confirmed', 'cancelled'], confirmed: ['preparing', 'cancelled'],
        preparing: ['ready'], ready: ['picked_up'], picked_up: ['on_the_way'], on_the_way: ['delivered'],
    };

    return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)', color: 'white', fontFamily: "'Inter', sans-serif" }}>
            {/* Header */}
            <div style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.1)', padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
                <Package size={28} color="#7c4dff" />
                <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, background: 'linear-gradient(135deg, #7c4dff, #448aff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Seller Dashboard</h1>
            </div>

            <div style={{ display: 'flex', minHeight: 'calc(100vh - 65px)' }}>
                {/* Sidebar */}
                <div style={{ width: 220, background: 'rgba(255,255,255,0.03)', borderRight: '1px solid rgba(255,255,255,0.08)', padding: '16px 0' }}>
                    {tabs.map(tab => (
                        <button key={tab.key} onClick={() => { setActiveTab(tab.key); setMessage(''); }}
                            style={{
                                width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '12px 20px',
                                background: activeTab === tab.key ? 'rgba(124,77,255,0.15)' : 'transparent',
                                border: 'none', color: activeTab === tab.key ? '#7c4dff' : 'rgba(255,255,255,0.6)',
                                cursor: 'pointer', fontSize: 14, textAlign: 'left', borderLeft: activeTab === tab.key ? '3px solid #7c4dff' : '3px solid transparent',
                                transition: 'all 0.2s',
                            }}
                        >{tab.icon}{tab.label}</button>
                    ))}
                </div>

                {/* Content */}
                <div style={{ flex: 1, padding: 24, overflow: 'auto' }}>
                    {message && <div style={{ background: 'rgba(124,77,255,0.15)', border: '1px solid rgba(124,77,255,0.3)', borderRadius: 8, padding: '10px 16px', marginBottom: 16, fontSize: 14 }}>{message}</div>}

                    {/* OVERVIEW */}
                    {activeTab === 'overview' && (
                        <div>
                            <h2 style={{ fontSize: 20, marginBottom: 20 }}>Dashboard Overview</h2>
                            {loading ? <p>Loading...</p> : dashboardData && (
                                <div>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
                                        {[
                                            { label: 'Total Products', value: dashboardData.products?.total || 0, color: '#7c4dff' },
                                            { label: 'Active Products', value: dashboardData.products?.active || 0, color: '#4caf50' },
                                            { label: 'Pending Approval', value: dashboardData.products?.pending || 0, color: '#ff9800' },
                                            { label: 'Total Orders', value: dashboardData.orders?.total || 0, color: '#2196f3' },
                                            { label: 'Pending Orders', value: dashboardData.orders?.pending || 0, color: '#ff5722' },
                                            { label: 'Delivered', value: dashboardData.orders?.delivered || 0, color: '#4caf50' },
                                            { label: 'Total Earnings', value: `₹${dashboardData.earnings?.total || 0}`, color: '#ffc107' },
                                        ].map((stat, i) => (
                                            <div key={i} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: 20, border: '1px solid rgba(255,255,255,0.08)' }}>
                                                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 8 }}>{stat.label}</div>
                                                <div style={{ fontSize: 28, fontWeight: 700, color: stat.color }}>{stat.value}</div>
                                            </div>
                                        ))}
                                    </div>
                                    {dashboardData.lowStockProducts?.length > 0 && (
                                        <div style={{ background: 'rgba(255,152,0,0.1)', border: '1px solid rgba(255,152,0,0.3)', borderRadius: 12, padding: 16 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}><AlertTriangle size={18} color="#ff9800" /> <b>Low Stock Alert</b></div>
                                            {dashboardData.lowStockProducts.map((p: any, i: number) => (
                                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: 14 }}>
                                                    <span>{p.name}</span><span style={{ color: '#ff9800' }}>{p.stock} left</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* ADD PRODUCT */}
                    {activeTab === 'add-product' && (
                        <div>
                            <h2 style={{ fontSize: 20, marginBottom: 20 }}>Add New Product</h2>
                            <form onSubmit={handleAddProduct} style={{ maxWidth: 600 }}>
                                {[
                                    { label: 'Product Name*', key: 'name', type: 'text', required: true },
                                    { label: 'Description*', key: 'description', type: 'text', required: true },
                                    { label: 'Price (₹)*', key: 'price', type: 'number', required: true },
                                    { label: 'Original Price (₹)', key: 'originalPrice', type: 'number' },
                                    { label: 'Stock Quantity*', key: 'stock', type: 'number', required: true },
                                    { label: 'Brand', key: 'brand', type: 'text' },
                                    { label: 'Tags (comma separated)', key: 'tags', type: 'text' },
                                    { label: 'Image URL', key: 'imageUrls', type: 'text' },
                                ].map(field => (
                                    <div key={field.key} style={{ marginBottom: 16 }}>
                                        <label style={{ display: 'block', fontSize: 13, color: 'rgba(255,255,255,0.6)', marginBottom: 6 }}>{field.label}</label>
                                        <input type={field.type} required={field.required}
                                            value={field.key === 'imageUrls' ? newProduct.imageUrls[0] : (newProduct as any)[field.key]}
                                            onChange={e => field.key === 'imageUrls' ? setNewProduct({ ...newProduct, imageUrls: [e.target.value] }) : setNewProduct({ ...newProduct, [field.key]: e.target.value })}
                                            style={{ width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, color: 'white', fontSize: 14, outline: 'none' }}
                                        />
                                    </div>
                                ))}
                                <div style={{ marginBottom: 16 }}>
                                    <label style={{ display: 'block', fontSize: 13, color: 'rgba(255,255,255,0.6)', marginBottom: 6 }}>Category*</label>
                                    <select value={newProduct.category} onChange={e => setNewProduct({ ...newProduct, category: e.target.value })}
                                        style={{ width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, color: 'white', fontSize: 14 }}>
                                        {CATEGORIES.map(c => <option key={c} value={c} style={{ background: '#302b63' }}>{c}</option>)}
                                    </select>
                                </div>
                                <div style={{ marginBottom: 16 }}>
                                    <label style={{ display: 'block', fontSize: 13, color: 'rgba(255,255,255,0.6)', marginBottom: 6 }}>Unit*</label>
                                    <select value={newProduct.unit} onChange={e => setNewProduct({ ...newProduct, unit: e.target.value })}
                                        style={{ width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, color: 'white', fontSize: 14 }}>
                                        {['kg', 'g', 'L', 'ml', 'pcs', 'pack', 'dozen', 'box'].map(u => <option key={u} value={u} style={{ background: '#302b63' }}>{u}</option>)}
                                    </select>
                                </div>
                                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                                    <button type="submit" disabled={loading}
                                        style={{ padding: '12px 32px', background: 'linear-gradient(135deg, #7c4dff, #448aff)', border: 'none', borderRadius: 8, color: 'white', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>
                                        {loading ? 'Submitting...' : 'Submit for Approval'}
                                    </button>
                                    <button type="button" onClick={() => {
                                        const samples = [
                                            { name: 'Aashirvaad Select Premium Sharbati Atta', description: '100% MP Sharbati wheat, making rotis softer. High-quality premium whole wheat flour.', price: '195', originalPrice: '220', category: 'Groceries', unit: 'kg', stock: '50', brand: 'Aashirvaad', tags: 'atta, wheat, flour, groceries', imageUrls: ['https://m.media-amazon.com/images/I/71Xm+T70E8L._SX679_.jpg'] },
                                            { name: 'India Gate Basmati Rice Classic', description: 'Aged basmati rice for everyday use, with distinctive aroma and fine texture.', price: '450', originalPrice: '520', category: 'Groceries', unit: 'kg', stock: '30', brand: 'India Gate', tags: 'rice, basmati, classic', imageUrls: ['https://m.media-amazon.com/images/I/61b7Lsp643L._SX679_.jpg'] },
                                            { name: 'Tata Salt, Vacuum Evaporated Iodised Salt', description: 'Vacuum evaporated iodised salt, ensuring the right amount of iodine for mental development.', price: '25', originalPrice: '28', category: 'Groceries', unit: 'kg', stock: '100', brand: 'Tata', tags: 'salt, namak, tata', imageUrls: ['https://m.media-amazon.com/images/I/51wXw019BGL._SX679_.jpg'] },
                                            { name: 'Fortune Sunlite Refined Sunflower Oil', description: 'Light, healthy and nutritious refined sunflower oil. Enhances the natural taste of your food.', price: '145', originalPrice: '160', category: 'Groceries', unit: 'L', stock: '40', brand: 'Fortune', tags: 'oil, cooking oil, sunflower', imageUrls: ['https://m.media-amazon.com/images/I/61H4hX+KigL._SX679_.jpg'] },
                                        ];
                                        const sample = samples[Math.floor(Math.random() * samples.length)];
                                        setNewProduct(sample);
                                    }} style={{ padding: '12px 20px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 8, color: 'white', fontSize: 13, cursor: 'pointer' }}>
                                        ✨ Fill Sample Data
                                    </button>
                                </div>
                                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 8 }}>Products are reviewed by admin before being visible to buyers.</p>
                            </form>
                        </div>
                    )}

                    {/* MY PRODUCTS */}
                    {activeTab === 'my-products' && (
                        <div>
                            <h2 style={{ fontSize: 20, marginBottom: 20 }}>My Products</h2>
                            {loading ? <p>Loading...</p> : products.length === 0 ? <p style={{ color: 'rgba(255,255,255,0.5)' }}>No products yet. Add your first product!</p> : (
                                <div style={{ display: 'grid', gap: 12 }}>
                                    {products.map((p: any) => (
                                        <div key={p._id} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: 16, display: 'flex', gap: 16, alignItems: 'center', border: '1px solid rgba(255,255,255,0.08)' }}>
                                            {p.imageUrls?.[0] && <img src={p.imageUrls[0]} alt={p.name} style={{ width: 60, height: 60, borderRadius: 8, objectFit: 'cover' }} />}
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontWeight: 600, marginBottom: 4 }}>{p.name}</div>
                                                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>₹{p.price} · {p.category} · Stock: {p.stock}</div>
                                            </div>
                                            <span style={{
                                                padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                                                background: `${statusColors[p.approvalStatus] || '#666'}22`,
                                                color: statusColors[p.approvalStatus] || '#999',
                                                border: `1px solid ${statusColors[p.approvalStatus] || '#666'}44`
                                            }}>
                                                {(p.approvalStatus || 'pending').toUpperCase()}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* ORDERS */}
                    {activeTab === 'orders' && (
                        <div>
                            <h2 style={{ fontSize: 20, marginBottom: 20 }}>Orders Received</h2>
                            {loading ? <p>Loading...</p> : orders.length === 0 ? <p style={{ color: 'rgba(255,255,255,0.5)' }}>No orders yet.</p> : (
                                <div style={{ display: 'grid', gap: 12 }}>
                                    {orders.map((o: any) => (
                                        <div key={o._id} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: 16, border: '1px solid rgba(255,255,255,0.08)' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                                <span style={{ fontWeight: 600 }}>#{o.orderNumber}</span>
                                                <span style={{ padding: '3px 10px', borderRadius: 12, fontSize: 12, background: `${statusColors[o.orderStatus] || '#666'}22`, color: statusColors[o.orderStatus] || '#999' }}>
                                                    {o.orderStatus?.toUpperCase()}
                                                </span>
                                            </div>
                                            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 8 }}>
                                                <div>{o.items?.length || 0} items · ₹{o.total} · {o.paymentMethod?.toUpperCase()}</div>
                                                <div>{o.userId?.name || 'Customer'} · {new Date(o.createdAt).toLocaleDateString()}</div>
                                            </div>
                                            {nextStatus[o.orderStatus]?.length > 0 && (
                                                <div style={{ display: 'flex', gap: 8 }}>
                                                    {nextStatus[o.orderStatus].map(s => (
                                                        <button key={s} onClick={() => handleUpdateStatus(o._id, s)}
                                                            style={{ padding: '6px 14px', background: s === 'cancelled' ? 'rgba(244,67,54,0.15)' : 'rgba(76,175,80,0.15)', border: `1px solid ${s === 'cancelled' ? '#f44336' : '#4caf50'}44`, borderRadius: 6, color: s === 'cancelled' ? '#f44336' : '#4caf50', fontSize: 12, cursor: 'pointer', fontWeight: 600 }}>
                                                            {s.replace(/_/g, ' ').toUpperCase()}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* EARNINGS */}
                    {activeTab === 'earnings' && (
                        <div>
                            <h2 style={{ fontSize: 20, marginBottom: 20 }}>Earnings</h2>
                            {loading ? <p>Loading...</p> : earnings && (
                                <div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
                                        <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: 20, border: '1px solid rgba(255,255,255,0.08)' }}>
                                            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>Total Earnings</div>
                                            <div style={{ fontSize: 32, fontWeight: 700, color: '#4caf50', marginTop: 8 }}>₹{earnings.total}</div>
                                        </div>
                                        <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: 20, border: '1px solid rgba(255,255,255,0.08)' }}>
                                            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>Total Orders</div>
                                            <div style={{ fontSize: 32, fontWeight: 700, color: '#2196f3', marginTop: 8 }}>{earnings.totalOrders}</div>
                                        </div>
                                    </div>
                                    <h3 style={{ fontSize: 16, marginBottom: 12 }}>Monthly Breakdown</h3>
                                    <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', height: 200, background: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: 16, border: '1px solid rgba(255,255,255,0.08)' }}>
                                        {earnings.monthly?.map((m: any, i: number) => {
                                            const maxAmount = Math.max(...earnings.monthly.map((x: any) => x.amount), 1);
                                            const height = m.amount > 0 ? Math.max((m.amount / maxAmount) * 150, 20) : 10;
                                            return (
                                                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                                                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>₹{m.amount}</span>
                                                    <div style={{ width: '80%', height, background: 'linear-gradient(180deg, #7c4dff, #448aff)', borderRadius: 6 }} />
                                                    <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>{m.month}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* INVENTORY */}
                    {activeTab === 'inventory' && (
                        <div>
                            <h2 style={{ fontSize: 20, marginBottom: 20 }}>Inventory Management</h2>
                            {loading ? <p>Loading...</p> : inventory && (
                                <div>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12, marginBottom: 24 }}>
                                        {[
                                            { label: 'Total Products', value: inventory.summary?.totalProducts || 0, color: '#7c4dff' },
                                            { label: 'Out of Stock', value: inventory.summary?.outOfStock || 0, color: '#f44336' },
                                            { label: 'Low Stock', value: inventory.summary?.lowStock || 0, color: '#ff9800' },
                                            { label: 'Total Value', value: `₹${inventory.summary?.totalValue || 0}`, color: '#4caf50' },
                                        ].map((s, i) => (
                                            <div key={i} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: 16, border: '1px solid rgba(255,255,255,0.08)' }}>
                                                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>{s.label}</div>
                                                <div style={{ fontSize: 22, fontWeight: 700, color: s.color, marginTop: 4 }}>{s.value}</div>
                                            </div>
                                        ))}
                                    </div>
                                    <div style={{ display: 'grid', gap: 8 }}>
                                        {inventory.products?.map((p: any) => (
                                            <div key={p._id} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 10, padding: 12, display: 'flex', alignItems: 'center', gap: 12, border: '1px solid rgba(255,255,255,0.08)' }}>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ fontWeight: 600, fontSize: 14 }}>{p.name}</div>
                                                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{p.category} · ₹{p.price}/{p.unit}</div>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                    <input type="number" defaultValue={p.stock} min={0}
                                                        style={{ width: 70, padding: '6px 10px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 6, color: 'white', fontSize: 14, textAlign: 'center' }}
                                                        onBlur={(e) => { const val = Number(e.target.value); if (val !== p.stock) handleUpdateStock(p._id, val); }}
                                                    />
                                                    <span style={{ fontSize: 12, color: p.stock === 0 ? '#f44336' : p.stock <= 10 ? '#ff9800' : '#4caf50' }}>
                                                        {p.stock === 0 ? 'OUT' : p.stock <= 10 ? 'LOW' : 'OK'}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* PROFILE */}
                    {activeTab === 'profile' && (
                        <div>
                            <h2 style={{ fontSize: 20, marginBottom: 20 }}>Seller Profile</h2>
                            <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: 24, border: '1px solid rgba(255,255,255,0.08)', maxWidth: 500 }}>
                                <div style={{ textAlign: 'center', marginBottom: 20 }}>
                                    <UserCircle size={64} color="rgba(255,255,255,0.3)" />
                                    <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 8 }}>Store profile details are managed from your store settings.</p>
                                </div>
                                {dashboardData?.store && (
                                    <div>
                                        <div style={{ marginBottom: 12 }}><span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>Store Name</span><div style={{ fontWeight: 600 }}>{dashboardData.store.name}</div></div>
                                        <div style={{ marginBottom: 12 }}><span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>Verified</span><div>{dashboardData.store.isVerified ? <CheckCircle size={16} color="#4caf50" /> : <Clock size={16} color="#ff9800" />}</div></div>
                                        <div style={{ marginBottom: 12 }}><span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>Status</span><div>{dashboardData.store.isOpen ? '🟢 Open' : '🔴 Closed'}</div></div>
                                        <div><span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>Rating</span><div>⭐ {dashboardData.store.rating || 'No ratings yet'}</div></div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SellerDashboard;
