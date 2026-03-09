import { Router } from 'express';
import { parseTextList, parseImageList } from '../controllers/assistantController';
import { generateContent } from '../controllers/geminiController';
import { authenticate } from '../middleware/auth';
import { apiLimiter } from '../middleware/rateLimiter';

const router = Router();

// Smart shopping assistant endpoints
router.post('/parse-list', authenticate, parseTextList);    // Text → products
router.post('/parse-image', authenticate, parseImageList);  // Image → OCR → products

// AI content generation proxy
router.post('/generate', authenticate, apiLimiter, generateContent);

export default router;
