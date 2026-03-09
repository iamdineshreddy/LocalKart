import { Request, Response } from 'express';
import { User } from '../models/User';
import { Store } from '../models/Store';
import { Product } from '../models/Product';
import { Order } from '../models/Order';
import { Review } from '../models/Review';
import { FraudReport } from '../models/FraudReport';
import { TrustScore } from '../models/TrustScore';
import jwt from 'jsonwebtoken';
import { getJwtSecret } from '../config/jwt';

// Admin login with .env credentials
export const adminLogin = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({ success: false, message: 'Email and password are required' });
            return;
        }
        const adminEmail = process.env.ADMIN_EMAIL || 'admin@localkart.com';
        const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123';
        if (email !== adminEmail || password !== adminPassword) {
            res.status(401).json({ success: false, message: 'Invalid admin credentials' });
            return;
        }
        let adminUser = await User.findOne({ email: adminEmail, role: 'admin' });
        if (!adminUser) {
            adminUser = new User({ name: 'Admin', email: adminEmail, phone: '0000000000', password: adminPassword, role: 'admin', isVerified: true, isActive: true, kyc: { status: 'verified' } });
            await adminUser.save();
        }
        const token = jwt.sign({ id: adminUser._id, phone: adminUser.phone, role: 'admin' }, getJwtSecret(), { expiresIn: '7d' });
        res.status(200).json({ success: true, message: 'Admin login successful', token, user: { id: adminUser._id, name: adminUser.name, email: adminUser.email, phone: adminUser.phone, role: adminUser.role, isVerified: adminUser.isVerified } });
    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Dashboard statistics (enhanced with orders, reviews, reports)
export const getDashboardStats = async (req: Request, res: Response): Promise<void> => {
    try {
        const [totalUsers, totalSellers, totalStores, totalProducts, activeProducts, inactiveProducts, verifiedStores, rejectedStores, pendingSellers, totalOrders, deliveredOrders, cancelledOrders, totalRevenue, totalReviews, openReports] = await Promise.all([
            User.countDocuments(), User.countDocuments({ role: 'seller' }), Store.countDocuments(), Product.countDocuments(),
            Product.countDocuments({ isActive: true }), Product.countDocuments({ isActive: false }),
            Store.countDocuments({ kycStatus: 'verified' }), Store.countDocuments({ kycStatus: 'rejected' }),
            Store.countDocuments({ kycStatus: { $in: ['pending', 'submitted'] } }),
            Order.countDocuments(), Order.countDocuments({ orderStatus: 'delivered' }), Order.countDocuments({ orderStatus: 'cancelled' }),
            Order.aggregate([{ $match: { paymentStatus: 'paid' } }, { $group: { _id: null, total: { $sum: '$total' } } }]),
            Review.countDocuments(), FraudReport.countDocuments({ status: { $in: ['open', 'investigating'] } }),
        ]);
        res.status(200).json({
            success: true, stats: { totalUsers, totalSellers, totalStores, totalProducts, activeProducts, inactiveProducts, pendingSellers, verifiedStores, rejectedStores, totalOrders, deliveredOrders, cancelledOrders, totalRevenue: totalRevenue.length > 0 ? totalRevenue[0].total : 0, totalReviews, openReports }
        });
    } catch (error) {
        console.error('Dashboard stats error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// List all sellers with their stores
export const getAllSellers = async (req: Request, res: Response): Promise<void> => {
    try {
        const { page = 1, limit = 20, status } = req.query;
        const storeQuery: any = {};
        if (status && status !== 'all') storeQuery.kycStatus = status;
        const stores = await Store.find(storeQuery).populate('ownerId', 'name email phone isActive isVerified createdAt').sort({ createdAt: -1 }).skip((parseInt(page as string) - 1) * parseInt(limit as string)).limit(parseInt(limit as string));
        const total = await Store.countDocuments(storeQuery);
        res.status(200).json({
            success: true,
            sellers: stores.map(store => ({ storeId: store._id, storeName: store.storeName, description: store.description, phone: store.phone, email: store.email, address: store.address, city: store.city, state: store.state, kycStatus: store.kycStatus, isActive: store.isActive, isVerified: store.isVerified, categories: store.categories, gstin: store.gstin, owner: store.ownerId, createdAt: store.createdAt })),
            total, page: parseInt(page as string), pages: Math.ceil(total / parseInt(limit as string)),
        });
    } catch (error) {
        console.error('Get all sellers error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Approve a seller
export const approveSeller = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const store = await Store.findById(id);
        if (!store) { res.status(404).json({ success: false, message: 'Store not found' }); return; }
        store.kycStatus = 'verified'; store.isVerified = true; store.isActive = true;
        await store.save();
        await User.findByIdAndUpdate(store.ownerId, { isActive: true });
        res.status(200).json({ success: true, message: 'Seller approved successfully' });
    } catch (error) {
        console.error('Approve seller error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Reject a seller
export const rejectSeller = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const store = await Store.findById(id);
        if (!store) { res.status(404).json({ success: false, message: 'Store not found' }); return; }
        store.kycStatus = 'rejected'; store.isVerified = false;
        await store.save();
        res.status(200).json({ success: true, message: 'Seller rejected' });
    } catch (error) {
        console.error('Reject seller error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// List all products for admin
export const getAdminProducts = async (req: Request, res: Response): Promise<void> => {
    try {
        const { page = 1, limit = 20, status } = req.query;
        const query: any = {};
        if (status === 'active') query.isActive = true;
        else if (status === 'inactive') query.isActive = false;
        const products = await Product.find(query).populate('storeId', 'storeName ownerId city').sort({ createdAt: -1 }).skip((parseInt(page as string) - 1) * parseInt(limit as string)).limit(parseInt(limit as string));
        const total = await Product.countDocuments(query);
        res.status(200).json({
            success: true,
            products: products.map(p => ({ id: p._id, name: p.name, description: p.description, price: p.price, category: p.category, stock: p.stock, isActive: p.isActive, isAvailable: p.isAvailable, imageUrl: p.thumbnailUrl || p.imageUrls?.[0] || '', store: p.storeId, totalSold: p.totalSold, rating: p.rating, createdAt: p.createdAt })),
            total, page: parseInt(page as string), pages: Math.ceil(total / parseInt(limit as string)),
        });
    } catch (error) {
        console.error('Get admin products error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Toggle product active status
export const toggleProduct = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { isActive } = req.body;
        const product = await Product.findByIdAndUpdate(id, { isActive }, { new: true });
        if (!product) { res.status(404).json({ success: false, message: 'Product not found' }); return; }
        res.status(200).json({ success: true, message: `Product ${isActive ? 'activated' : 'deactivated'}` });
    } catch (error) {
        console.error('Toggle product error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// List all users for admin
export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
    try {
        const { page = 1, limit = 20, role, search } = req.query;
        const query: any = {};
        if (role && role !== 'all') query.role = role;
        if (search) {
            query.$or = [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }, { phone: { $regex: search, $options: 'i' } }];
        }
        const users = await User.find(query).select('name email phone role isVerified isActive createdAt').sort({ createdAt: -1 }).skip((parseInt(page as string) - 1) * parseInt(limit as string)).limit(parseInt(limit as string));
        const total = await User.countDocuments(query);
        res.status(200).json({ success: true, users, total, page: parseInt(page as string), pages: Math.ceil(total / parseInt(limit as string)) });
    } catch (error) {
        console.error('Get all users error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// List all orders for admin
export const getAllOrders = async (req: Request, res: Response): Promise<void> => {
    try {
        const { page = 1, limit = 20, status, paymentStatus } = req.query;
        const query: any = {};
        if (status && status !== 'all') query.orderStatus = status;
        if (paymentStatus && paymentStatus !== 'all') query.paymentStatus = paymentStatus;
        const orders = await Order.find(query).populate('userId', 'name email phone').populate('storeId', 'storeName city').sort({ createdAt: -1 }).skip((parseInt(page as string) - 1) * parseInt(limit as string)).limit(parseInt(limit as string));
        const total = await Order.countDocuments(query);
        res.status(200).json({
            success: true,
            orders: orders.map(o => ({ id: o._id, orderNumber: o.orderNumber, user: o.userId, store: o.storeId, itemCount: o.items.length, total: o.total, paymentMethod: o.paymentMethod, paymentStatus: o.paymentStatus, orderStatus: o.orderStatus, createdAt: o.createdAt })),
            total, page: parseInt(page as string), pages: Math.ceil(total / parseInt(limit as string)),
        });
    } catch (error) {
        console.error('Get all orders error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
