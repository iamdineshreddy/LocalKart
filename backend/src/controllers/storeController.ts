import { Request, Response } from 'express';
import { Store } from '../models/Store';
import { Product } from '../models/Product';
import { findNearestStores, getProductsFromNearestStores } from '../services/locationService';

// Get nearest stores
export const getNearestStores = async (req: Request, res: Response): Promise<void> => {
    try {
        const { latitude, longitude, radius = 10, limit = 10 } = req.query;

        if (!latitude || !longitude) {
            res.status(400).json({ success: false, message: 'Location required' });
            return;
        }

        const stores = await findNearestStores(
            parseFloat(latitude as string),
            parseFloat(longitude as string),
            parseFloat(radius as string),
            parseInt(limit as string)
        );

        res.status(200).json({
            success: true,
            stores
        });
    } catch (error) {
        console.error('Get nearest stores error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Get store details
export const getStoreDetails = async (req: Request, res: Response): Promise<void> => {
    try {
        const { storeId } = req.params;

        const store = await Store.findById(storeId);

        if (!store) {
            res.status(404).json({ success: false, message: 'Store not found' });
            return;
        }

        res.status(200).json({
            success: true,
            store
        });
    } catch (error) {
        console.error('Get store details error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Create store (seller registration)
export const createStore = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user?.id;
        const storeData = req.body;

        // Check if user already has a store
        const existingStore = await Store.findOne({ ownerId: userId });
        if (existingStore) {
            res.status(400).json({ success: false, message: 'You already have a store' });
            return;
        }

        const store = new Store({
            ...storeData,
            ownerId: userId
        });

        await store.save();

        // Update user role to seller
        await User.findByIdAndUpdate(userId, { role: 'seller' });

        res.status(201).json({
            success: true,
            message: 'Store created successfully',
            store
        });
    } catch (error) {
        console.error('Create store error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Update store
export const updateStore = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user?.id;
        const updates = req.body;

        const store = await Store.findOneAndUpdate(
            { ownerId: userId },
            updates,
            { new: true }
        );

        if (!store) {
            res.status(404).json({ success: false, message: 'Store not found' });
            return;
        }

        res.status(200).json({
            success: true,
            store
        });
    } catch (error) {
        console.error('Update store error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Get my store (for sellers)
export const getMyStore = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user?.id;

        const store = await Store.findOne({ ownerId: userId });

        if (!store) {
            res.status(404).json({ success: false, message: 'Store not found' });
            return;
        }

        res.status(200).json({
            success: true,
            store
        });
    } catch (error) {
        console.error('Get my store error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Get products from nearest stores
export const getNearbyProducts = async (req: Request, res: Response): Promise<void> => {
    try {
        const { latitude, longitude, category, limit = 50 } = req.query;

        if (!latitude || !longitude) {
            res.status(400).json({ success: false, message: 'Location required' });
            return;
        }

        const products = await getProductsFromNearestStores(
            parseFloat(latitude as string),
            parseFloat(longitude as string),
            category as string,
            parseInt(limit as string)
        );

        res.status(200).json({
            success: true,
            products
        });
    } catch (error) {
        console.error('Get nearby products error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Get all stores (for admin)
export const getAllStores = async (req: Request, res: Response): Promise<void> => {
    try {
        const { page = 1, limit = 20, status } = req.query;

        const query: any = {};
        if (status) {
            query.isActive = status === 'active';
        }

        const stores = await Store.find(query)
            .populate('ownerId', 'name email phone')
            .skip((parseInt(page as string) - 1) * parseInt(limit as string))
            .limit(parseInt(limit as string));

        const total = await Store.countDocuments(query);

        res.status(200).json({
            success: true,
            stores,
            total,
            page: parseInt(page as string),
            pages: Math.ceil(total / parseInt(limit as string))
        });
    } catch (error) {
        console.error('Get all stores error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

import { User } from '../models/User';
