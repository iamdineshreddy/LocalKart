import { Request, Response } from 'express';
import { Product } from '../models/Product';
import { Order } from '../models/Order';
import { Store } from '../models/Store';

// Get seller dashboard overview
export const getSellerDashboard = async (req: Request, res: Response): Promise<void> => {
    try {
        const sellerId = (req as any).user?.id;
        const store = await Store.findOne({ ownerId: sellerId });

        if (!store) {
            res.status(404).json({ success: false, message: 'Store not found. Please create a store first.' });
            return;
        }

        const totalProducts = await Product.countDocuments({ storeId: store._id });
        const activeProducts = await Product.countDocuments({ storeId: store._id, isActive: true, approvalStatus: 'approved' });
        const pendingProducts = await Product.countDocuments({ storeId: store._id, approvalStatus: 'pending' });
        const rejectedProducts = await Product.countDocuments({ storeId: store._id, approvalStatus: 'rejected' });

        const orders = await Order.find({ storeId: store._id });
        const totalOrders = orders.length;
        const pendingOrders = orders.filter(o => ['placed', 'confirmed'].includes(o.orderStatus)).length;
        const deliveredOrders = orders.filter(o => o.orderStatus === 'delivered').length;

        const totalEarnings = orders
            .filter(o => o.orderStatus === 'delivered' && o.paymentStatus === 'paid')
            .reduce((sum, o) => sum + o.total, 0);

        const lowStockProducts = await Product.find({
            storeId: store._id,
            stock: { $lte: 10 },
            isActive: true
        }).select('name stock').limit(10);

        res.status(200).json({
            success: true,
            dashboard: {
                store: {
                    name: store.storeName,
                    isVerified: store.isVerified,
                    isOpen: store.isOpen,
                    rating: store.rating,
                },
                products: { total: totalProducts, active: activeProducts, pending: pendingProducts, rejected: rejectedProducts },
                orders: { total: totalOrders, pending: pendingOrders, delivered: deliveredOrders },
                earnings: { total: totalEarnings },
                lowStockProducts
            }
        });
    } catch (error) {
        console.error('Seller dashboard error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Get seller's orders
export const getSellerOrders = async (req: Request, res: Response): Promise<void> => {
    try {
        const sellerId = (req as any).user?.id;
        const store = await Store.findOne({ ownerId: sellerId });
        if (!store) {
            res.status(404).json({ success: false, message: 'Store not found' });
            return;
        }

        const { status, page = 1, limit = 20 } = req.query;
        const query: any = { storeId: store._id };
        if (status) query.orderStatus = status;

        const orders = await Order.find(query)
            .populate('userId', 'name email phone')
            .sort({ createdAt: -1 })
            .skip((Number(page) - 1) * Number(limit))
            .limit(Number(limit));

        const total = await Order.countDocuments(query);

        res.status(200).json({
            success: true,
            orders,
            pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) }
        });
    } catch (error) {
        console.error('Seller orders error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Update order status (seller)
export const updateOrderStatus = async (req: Request, res: Response): Promise<void> => {
    try {
        const sellerId = (req as any).user?.id;
        const { id } = req.params;
        const { status, note } = req.body;

        const store = await Store.findOne({ ownerId: sellerId });
        if (!store) {
            res.status(404).json({ success: false, message: 'Store not found' });
            return;
        }

        const validTransitions: Record<string, string[]> = {
            'placed': ['confirmed', 'cancelled'],
            'confirmed': ['preparing', 'cancelled'],
            'preparing': ['ready'],
            'ready': ['picked_up'],
            'picked_up': ['on_the_way'],
            'on_the_way': ['delivered'],
        };

        const order = await Order.findOne({ _id: id, storeId: store._id });
        if (!order) {
            res.status(404).json({ success: false, message: 'Order not found' });
            return;
        }

        const allowed = validTransitions[order.orderStatus] || [];
        if (!allowed.includes(status)) {
            res.status(400).json({ success: false, message: `Cannot transition from ${order.orderStatus} to ${status}` });
            return;
        }

        order.orderStatus = status;
        order.statusHistory.push({ status, timestamp: new Date(), note });

        if (status === 'delivered') {
            order.actualDeliveryTime = new Date();
            if (order.paymentMethod === 'cod') {
                order.paymentStatus = 'paid';
            }
        }

        await order.save();

        res.status(200).json({
            success: true,
            message: `Order status updated to ${status}`,
            order
        });
    } catch (error) {
        console.error('Update order status error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Get seller earnings breakdown
export const getSellerEarnings = async (req: Request, res: Response): Promise<void> => {
    try {
        const sellerId = (req as any).user?.id;
        const store = await Store.findOne({ ownerId: sellerId });
        if (!store) {
            res.status(404).json({ success: false, message: 'Store not found' });
            return;
        }

        const deliveredOrders = await Order.find({
            storeId: store._id,
            orderStatus: 'delivered',
            paymentStatus: 'paid'
        }).sort({ createdAt: -1 });

        const totalEarnings = deliveredOrders.reduce((sum, o) => sum + o.total, 0);

        // Monthly breakdown (last 6 months)
        const monthlyEarnings: { month: string; amount: number; orders: number }[] = [];
        const now = new Date();
        for (let i = 5; i >= 0; i--) {
            const startDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const endDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
            const monthOrders = deliveredOrders.filter(o => o.createdAt >= startDate && o.createdAt <= endDate);
            monthlyEarnings.push({
                month: startDate.toLocaleString('default', { month: 'short', year: 'numeric' }),
                amount: monthOrders.reduce((s, o) => s + o.total, 0),
                orders: monthOrders.length
            });
        }

        res.status(200).json({
            success: true,
            earnings: {
                total: totalEarnings,
                totalOrders: deliveredOrders.length,
                monthly: monthlyEarnings,
                recentOrders: deliveredOrders.slice(0, 10).map(o => ({
                    orderNumber: o.orderNumber,
                    amount: o.total,
                    date: o.createdAt
                }))
            }
        });
    } catch (error) {
        console.error('Seller earnings error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Get seller inventory
export const getSellerInventory = async (req: Request, res: Response): Promise<void> => {
    try {
        const sellerId = (req as any).user?.id;
        const store = await Store.findOne({ ownerId: sellerId });
        if (!store) {
            res.status(404).json({ success: false, message: 'Store not found' });
            return;
        }

        const { category, lowStock } = req.query;
        const query: any = { storeId: store._id };
        if (category) query.category = category;
        if (lowStock === 'true') query.stock = { $lte: 10 };

        const products = await Product.find(query)
            .select('name category stock price unit isAvailable approvalStatus imageUrls')
            .sort({ stock: 1 });

        const totalValue = products.reduce((sum, p) => sum + (p.price * p.stock), 0);
        const outOfStock = products.filter(p => p.stock === 0).length;
        const lowStockCount = products.filter(p => p.stock > 0 && p.stock <= 10).length;

        res.status(200).json({
            success: true,
            inventory: {
                products,
                summary: {
                    totalProducts: products.length,
                    totalValue,
                    outOfStock,
                    lowStock: lowStockCount
                }
            }
        });
    } catch (error) {
        console.error('Seller inventory error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Update product stock
export const updateProductStock = async (req: Request, res: Response): Promise<void> => {
    try {
        const sellerId = (req as any).user?.id;
        const { id } = req.params;
        const { stock } = req.body;

        const store = await Store.findOne({ ownerId: sellerId });
        if (!store) {
            res.status(404).json({ success: false, message: 'Store not found' });
            return;
        }

        const product = await Product.findOne({ _id: id, storeId: store._id });
        if (!product) {
            res.status(404).json({ success: false, message: 'Product not found' });
            return;
        }

        product.stock = stock;
        product.isAvailable = stock > 0;
        await product.save();

        res.status(200).json({
            success: true,
            message: 'Stock updated',
            product: { name: product.name, stock: product.stock, isAvailable: product.isAvailable }
        });
    } catch (error) {
        console.error('Update stock error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
