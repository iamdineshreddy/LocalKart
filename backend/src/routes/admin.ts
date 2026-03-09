import { Router } from 'express';
import { authenticate, isAdmin } from '../middleware/auth';
import { authLimiter } from '../middleware/rateLimiter';
import {
    adminLogin,
    getDashboardStats,
    getAllSellers,
    approveSeller,
    rejectSeller,
    getAdminProducts,
    toggleProduct,
    getAllUsers,
    getAllOrders,
} from '../controllers/adminController';

const router = Router();

// Public admin login (with rate limiting)
router.post('/login', authLimiter, adminLogin);

// Protected admin routes — dashboard
router.get('/dashboard', authenticate, isAdmin, getDashboardStats);

// Seller management
router.get('/sellers', authenticate, isAdmin, getAllSellers);
router.put('/sellers/:id/approve', authenticate, isAdmin, approveSeller);
router.put('/sellers/:id/reject', authenticate, isAdmin, rejectSeller);

// Product management
router.get('/products', authenticate, isAdmin, getAdminProducts);
router.put('/products/:id/toggle', authenticate, isAdmin, toggleProduct);

// User management (NEW)
router.get('/users', authenticate, isAdmin, getAllUsers);

// Order management (NEW)
router.get('/orders', authenticate, isAdmin, getAllOrders);

export default router;
