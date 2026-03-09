import { Router } from 'express';
import { getRecommendations, getTrending, getPopular } from '../controllers/assistantController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Personalized recommendations (requires login)
router.get('/personalized', authenticate, getRecommendations);

// Public recommendation endpoints
router.get('/trending', getTrending);
router.get('/popular', getPopular);

export default router;
