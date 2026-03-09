import { Router } from 'express';
import {
    getNearestStores,
    getStoreDetails,
    createStore,
    updateStore,
    getMyStore,
    getNearbyProducts,
    getAllStores
} from '../controllers/storeController';
import { authenticate, isSeller, isAdmin } from '../middleware/auth';
import { storeValidation } from '../middleware/validate';

const router = Router();

// Public routes
router.get('/nearby', getNearestStores);
router.get('/products', getNearbyProducts);
router.get('/:storeId', getStoreDetails);

// Seller routes
router.post('/', authenticate, isSeller, storeValidation, createStore);
router.put('/', authenticate, isSeller, storeValidation, updateStore);
router.get('/me/my-store', authenticate, isSeller, getMyStore);

// Admin routes
router.get('/admin/all', authenticate, isAdmin, getAllStores);

export default router;
