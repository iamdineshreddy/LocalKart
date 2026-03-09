import { Router } from 'express';
import { createReview, getProductReviews, getStoreReviews, markHelpful } from '../controllers/reviewController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/product/:id', getProductReviews);
router.get('/store/:id', getStoreReviews);

// Authenticated routes
router.post('/', authenticate, createReview);
router.put('/:id/helpful', authenticate, markHelpful);

export default router;
