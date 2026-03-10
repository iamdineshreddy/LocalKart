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
    getPendingProducts,
    approveProduct,
    rejectProduct,
    toggleProduct,
    getAllUsers,
    getAllOrders,
    getPendingKYC,
    approveKYC,
    rejectKYC,
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
router.get('/products/pending', authenticate, isAdmin, getPendingProducts);
router.put('/products/:id/approve', authenticate, isAdmin, approveProduct);
router.put('/products/:id/reject', authenticate, isAdmin, rejectProduct);
router.put('/products/:id/toggle', authenticate, isAdmin, toggleProduct);

// User management
router.get('/users', authenticate, isAdmin, getAllUsers);

// Order management
router.get('/orders', authenticate, isAdmin, getAllOrders);

// KYC management
router.get('/kyc/pending', authenticate, isAdmin, getPendingKYC);
router.put('/kyc/:id/approve', authenticate, isAdmin, approveKYC);
router.put('/kyc/:id/reject', authenticate, isAdmin, rejectKYC);

export default router;
