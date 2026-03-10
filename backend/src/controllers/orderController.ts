import { Request, Response } from 'express';
import { Order } from '../models/Order';
import { Product } from '../models/Product';
import { v4 as uuidv4 } from 'uuid';

// Create a new order
export const createOrder = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user?.id;
        const { items, deliveryAddress, paymentMethod, paymentStatus, paymentId } = req.body;

        if (!items || items.length === 0) {
            res.status(400).json({ success: false, message: 'Order items are required' });
            return;
        }

        if (!deliveryAddress) {
            res.status(400).json({ success: false, message: 'Delivery address is required' });
            return;
        }

        // Calculate totals
        let subtotal = 0;
        const orderItems = [];
        for (const item of items) {
            const product = await Product.findById(item.productId);
            if (!product) {
                res.status(400).json({ success: false, message: `Product not found: ${item.productId}` });
                return;
            }
            if (product.stock < item.quantity) {
                res.status(400).json({ success: false, message: `Insufficient stock for ${product.name}` });
                return;
            }
            const itemTotal = product.price * item.quantity;
            subtotal += itemTotal;
            orderItems.push({
                productId: product._id,
                storeId: product.storeId,
                productName: product.name,
                productImage: product.imageUrls?.[0] || '',
                quantity: item.quantity,
                unit: product.unit,
                price: product.price,
                total: itemTotal
            });

            // Reduce stock
            product.stock -= item.quantity;
            product.totalSold += item.quantity;
            if (product.stock === 0) product.isAvailable = false;
            await product.save();
        }

        const deliveryFee = subtotal >= 500 ? 0 : 30;
        const tax = Math.round(subtotal * 0.05);
        const total = subtotal + deliveryFee + tax;

        const orderNumber = `LK-${Date.now()}-${uuidv4().slice(0, 4).toUpperCase()}`;

        const newOrder = new Order({
            orderNumber,
            userId,
            items: orderItems,
            storeId: orderItems[0].storeId,
            deliveryAddress: {
                ...deliveryAddress,
                location: deliveryAddress.location || {
                    type: 'Point',
                    coordinates: [78.4867, 17.3850]
                }
            },
            subtotal,
            deliveryFee,
            discount: 0,
            tax,
            total,
            paymentMethod: paymentMethod || 'cod',
            paymentStatus: paymentStatus || (paymentMethod === 'online' ? 'paid' : 'pending'),
            paymentId,
            orderStatus: 'placed',
            statusHistory: [{ status: 'placed', timestamp: new Date(), note: 'Order placed by customer' }]
        });

        await newOrder.save();

        res.status(201).json({
            success: true,
            message: 'Order placed successfully',
            order: newOrder
        });
    } catch (error) {
        console.error('Create order error:', error);
        res.status(500).json({ success: false, message: 'Server error creating order' });
    }
};

// Get user orders
export const getMyOrders = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user?.id;
        const { status, page = 1, limit = 20 } = req.query;
        const query: any = { userId };
        if (status) query.orderStatus = status;

        const orders = await Order.find(query)
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
        console.error('Get my orders error:', error);
        res.status(500).json({ success: false, message: 'Server error fetching orders' });
    }
};

// Get single order details
export const getOrderDetails = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user?.id;
        const { id } = req.params;

        const order = await Order.findOne({ _id: id, userId })
            .populate('storeId', 'storeName phone address');

        if (!order) {
            res.status(404).json({ success: false, message: 'Order not found' });
            return;
        }

        res.status(200).json({ success: true, order });
    } catch (error) {
        console.error('Get order details error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Cancel order (buyer)
export const cancelOrder = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user?.id;
        const { id } = req.params;
        const { reason } = req.body;

        const order = await Order.findOne({ _id: id, userId });
        if (!order) {
            res.status(404).json({ success: false, message: 'Order not found' });
            return;
        }

        const cancellableStatuses = ['placed', 'confirmed'];
        if (!cancellableStatuses.includes(order.orderStatus)) {
            res.status(400).json({ success: false, message: `Cannot cancel order in "${order.orderStatus}" status` });
            return;
        }

        order.orderStatus = 'cancelled';
        order.cancelledAt = new Date();
        order.cancellationReason = reason || 'Cancelled by customer';
        order.statusHistory.push({ status: 'cancelled', timestamp: new Date(), note: reason || 'Cancelled by customer' });

        // Restore stock
        for (const item of order.items) {
            await Product.findByIdAndUpdate(item.productId, {
                $inc: { stock: item.quantity, totalSold: -item.quantity },
                isAvailable: true
            });
        }

        // If paid online, mark for refund
        if (order.paymentStatus === 'paid') {
            order.paymentStatus = 'refunded';
        }

        await order.save();

        res.status(200).json({ success: true, message: 'Order cancelled successfully', order });
    } catch (error) {
        console.error('Cancel order error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
