import { Request, Response } from 'express';
import { Order } from '../models/Order';

// Create a new order
export const createOrder = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user?.id;
        const { items, total, address, paymentMethod, paymentStatus, paymentId } = req.body;

        if (!items || items.length === 0) {
            res.status(400).json({ success: false, message: 'Order items are required' });
            return;
        }

        const newOrder = new Order({
            userId,
            items,
            total,
            address,
            paymentMethod,
            paymentStatus: paymentStatus || 'pending',
            paymentId,
            status: 'pending'
        });

        await newOrder.save();

        res.status(201).json({
            success: true,
            message: 'Order created successfully',
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
        const orders = await Order.find({ userId }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            orders
        });
    } catch (error) {
        console.error('Get my orders error:', error);
        res.status(500).json({ success: false, message: 'Server error fetching orders' });
    }
};
