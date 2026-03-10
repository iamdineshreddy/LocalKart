import { Router } from 'express';
import { authenticate, isSeller } from '../middleware/auth';
import {
    getSellerDashboard,
    getSellerOrders,
    updateOrderStatus,
    getSellerEarnings,
    getSellerInventory,
    updateProductStock,
} from '../controllers/sellerController';

const router = Router();

// All seller routes require authentication and seller role
router.get('/dashboard', authenticate, isSeller, getSellerDashboard);
router.get('/orders', authenticate, isSeller, getSellerOrders);
router.put('/orders/:id/status', authenticate, isSeller, updateOrderStatus);
router.get('/earnings', authenticate, isSeller, getSellerEarnings);
router.get('/inventory', authenticate, isSeller, getSellerInventory);
router.put('/inventory/:id/stock', authenticate, isSeller, updateProductStock);

export default router;
