import { Router } from 'express';
import authRoutes from './auth';
import kycRoutes from './kyc';
import storeRoutes from './store';
import productRoutes from './product';
import adminRoutes from './admin';
import reviewRoutes from './review';
import reportRoutes from './report';
import assistantRoutes from './assistant';
import recommendationRoutes from './recommendation';
import orderRoutes from './order';

const router = Router();

router.use('/auth', authRoutes);
router.use('/kyc', kycRoutes);
router.use('/stores', storeRoutes);
router.use('/products', productRoutes);
router.use('/admin', adminRoutes);
router.use('/reviews', reviewRoutes);
router.use('/reports', reportRoutes);
router.use('/assistant', assistantRoutes);
router.use('/recommendations', recommendationRoutes);
router.use('/orders', orderRoutes);

// Health check
router.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'LocalKart API is running' });
});

export default router;
