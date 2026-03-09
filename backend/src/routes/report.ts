import { Router } from 'express';
import { submitReport, getAdminReports, actionOnReport, analyzeSellerRisk } from '../controllers/fraudController';
import { authenticate, isAdmin } from '../middleware/auth';

const router = Router();

// Buyer: submit a fraud report
router.post('/', authenticate, submitReport);

// Admin: fraud report management
router.get('/admin', authenticate, isAdmin, getAdminReports);
router.put('/admin/:id/action', authenticate, isAdmin, actionOnReport);
router.get('/admin/analyze/:sellerId/:storeId', authenticate, isAdmin, analyzeSellerRisk);

export default router;
