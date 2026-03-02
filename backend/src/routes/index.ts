import { Router } from 'express';
import authRoutes from './auth';
import kycRoutes from './kyc';
import storeRoutes from './store';
import productRoutes from './product';

const router = Router();

router.use('/auth', authRoutes);
router.use('/kyc', kycRoutes);
router.use('/stores', storeRoutes);
router.use('/products', productRoutes);

// Health check
router.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'LocalKart API is running' });
});

export default router;
