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

// Admin login with .env credentials OR DB-based admin user
export const adminLogin = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({ success: false, message: 'Email and password are required' });
            return;
        }

        // Try DB-based admin login first
        const dbAdmin = await User.findOne({ email: email.toLowerCase(), role: 'admin' }).select('+password');
        if (dbAdmin) {
            const isMatch = await dbAdmin.comparePassword(password);
            if (isMatch) {
                const token = jwt.sign({ id: dbAdmin._id, phone: dbAdmin.phone, role: 'admin' }, getJwtSecret(), { expiresIn: '7d' });
                res.status(200).json({ success: true, message: 'Admin login successful', token, user: { id: dbAdmin._id, name: dbAdmin.name, email: dbAdmin.email, phone: dbAdmin.phone, role: dbAdmin.role, isVerified: dbAdmin.isVerified } });
                return;
            }
        }

        // Fallback to .env credentials
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

// Dashboard statistics
export const getDashboardStats = async (req: Request, res: Response): Promise<void> => {
    try {
        const [totalUsers, totalSellers, totalStores, totalProducts, activeProducts, inactiveProducts, pendingProducts, verifiedStores, rejectedStores, pendingSellers, totalOrders, deliveredOrders, cancelledOrders, totalRevenue, totalReviews, openReports, pendingKYC] = await Promise.all([
            User.countDocuments(), User.countDocuments({ role: 'seller' }), Store.countDocuments(), Product.countDocuments(),
            Product.countDocuments({ isActive: true, approvalStatus: 'approved' }), Product.countDocuments({ isActive: false }),
            Product.countDocuments({ approvalStatus: 'pending' }),
            Store.countDocuments({ kycStatus: 'verified' }), Store.countDocuments({ kycStatus: 'rejected' }),
            Store.countDocuments({ kycStatus: { $in: ['pending', 'submitted'] } }),
            Order.countDocuments(), Order.countDocuments({ orderStatus: 'delivered' }), Order.countDocuments({ orderStatus: 'cancelled' }),
            Order.aggregate([{ $match: { paymentStatus: 'paid' } }, { $group: { _id: null, total: { $sum: '$total' } } }]),
            Review.countDocuments(), FraudReport.countDocuments({ status: { $in: ['open', 'investigating'] } }),
            User.countDocuments({ 'kyc.status': { $in: ['pending', 'submitted'] } }),
        ]);
        res.status(200).json({
            success: true, stats: { totalUsers, totalSellers, totalStores, totalProducts, activeProducts, inactiveProducts, pendingProducts, pendingSellers, verifiedStores, rejectedStores, totalOrders, deliveredOrders, cancelledOrders, totalRevenue: totalRevenue.length > 0 ? totalRevenue[0].total : 0, totalReviews, openReports, pendingKYC }
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
        const { page = 1, limit = 20, status, approvalStatus } = req.query;
        const query: any = {};
        if (status === 'active') query.isActive = true;
        else if (status === 'inactive') query.isActive = false;
        if (approvalStatus && approvalStatus !== 'all') query.approvalStatus = approvalStatus;
        const products = await Product.find(query).populate('storeId', 'storeName ownerId city').sort({ createdAt: -1 }).skip((parseInt(page as string) - 1) * parseInt(limit as string)).limit(parseInt(limit as string));
        const total = await Product.countDocuments(query);
        res.status(200).json({
            success: true,
            products: products.map(p => ({ id: p._id, name: p.name, description: p.description, price: p.price, category: p.category, stock: p.stock, isActive: p.isActive, isAvailable: p.isAvailable, approvalStatus: p.approvalStatus, rejectionReason: p.rejectionReason, imageUrl: p.thumbnailUrl || p.imageUrls?.[0] || '', store: p.storeId, totalSold: p.totalSold, rating: p.rating, createdAt: p.createdAt })),
            total, page: parseInt(page as string), pages: Math.ceil(total / parseInt(limit as string)),
        });
    } catch (error) {
        console.error('Get admin products error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Get pending products for approval
export const getPendingProducts = async (req: Request, res: Response): Promise<void> => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const products = await Product.find({ approvalStatus: 'pending' })
            .populate('storeId', 'storeName ownerId city')
            .populate('sellerId', 'name email phone')
            .sort({ createdAt: -1 })
            .skip((parseInt(page as string) - 1) * parseInt(limit as string))
            .limit(parseInt(limit as string));
        const total = await Product.countDocuments({ approvalStatus: 'pending' });
        res.status(200).json({
            success: true,
            products: products.map(p => ({
                id: p._id, name: p.name, description: p.description, price: p.price,
                category: p.category, stock: p.stock, unit: p.unit,
                imageUrl: p.thumbnailUrl || p.imageUrls?.[0] || '',
                imageUrls: p.imageUrls, store: p.storeId, seller: p.sellerId,
                createdAt: p.createdAt
            })),
            total, page: parseInt(page as string), pages: Math.ceil(total / parseInt(limit as string)),
        });
    } catch (error) {
        console.error('Get pending products error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Approve a product
export const approveProduct = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const product = await Product.findById(id);
        if (!product) { res.status(404).json({ success: false, message: 'Product not found' }); return; }
        product.approvalStatus = 'approved';
        product.isActive = true;
        product.rejectionReason = undefined;
        await product.save();
        res.status(200).json({ success: true, message: 'Product approved successfully' });
    } catch (error) {
        console.error('Approve product error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Reject a product
export const rejectProduct = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { reason } = req.body;
        const product = await Product.findById(id);
        if (!product) { res.status(404).json({ success: false, message: 'Product not found' }); return; }
        product.approvalStatus = 'rejected';
        product.isActive = false;
        product.rejectionReason = reason || 'Product does not meet guidelines';
        await product.save();
        res.status(200).json({ success: true, message: 'Product rejected' });
    } catch (error) {
        console.error('Reject product error:', error);
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
        const users = await User.find(query).select('name email phone role isVerified isActive kyc.status createdAt').sort({ createdAt: -1 }).skip((parseInt(page as string) - 1) * parseInt(limit as string)).limit(parseInt(limit as string));
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

// Get pending KYC for admin review
export const getPendingKYC = async (req: Request, res: Response): Promise<void> => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const users = await User.find({ 'kyc.status': { $in: ['pending', 'submitted'] } })
            .select('name email phone role kyc createdAt')
            .sort({ 'kyc.submittedAt': -1 })
            .skip((parseInt(page as string) - 1) * parseInt(limit as string))
            .limit(parseInt(limit as string));
        const total = await User.countDocuments({ 'kyc.status': { $in: ['pending', 'submitted'] } });
        res.status(200).json({ success: true, users, total, page: parseInt(page as string), pages: Math.ceil(total / parseInt(limit as string)) });
    } catch (error) {
        console.error('Get pending KYC error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Approve KYC
export const approveKYC = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);
        if (!user) { res.status(404).json({ success: false, message: 'User not found' }); return; }
        user.kyc.status = 'verified';
        user.kyc.verifiedAt = new Date();
        user.isVerified = true;
        await user.save();
        res.status(200).json({ success: true, message: 'KYC approved' });
    } catch (error) {
        console.error('Approve KYC error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Reject KYC
export const rejectKYC = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { reason } = req.body;
        const user = await User.findById(id);
        if (!user) { res.status(404).json({ success: false, message: 'User not found' }); return; }
        user.kyc.status = 'rejected';
        user.kyc.rejectionReason = reason || 'Documents not valid';
        await user.save();
        res.status(200).json({ success: true, message: 'KYC rejected' });
    } catch (error) {
        console.error('Reject KYC error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
