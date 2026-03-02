import { Router } from 'express';
import {
    initiateDigilocker,
    handleDigilockerCallbackController,
    submitKYCDocuments,
    getKYCStatus,
    verifyAadhaarController,
    verifyPANController,
    getPendingKYCs,
    processKYC
} from '../controllers/kycController';
import { authenticate, isAdmin } from '../middleware/auth';

const router = Router();

// User KYC routes
router.get('/digilocker/initiate', authenticate, initiateDigilocker);
router.get('/digilocker/callback', handleDigilockerCallbackController);
router.post('/submit', authenticate, submitKYCDocuments);
router.get('/status', authenticate, getKYCStatus);

// Verification routes
router.post('/verify/aadhaar', authenticate, verifyAadhaarController);
router.post('/verify/pan', authenticate, verifyPANController);

// Admin routes
router.get('/admin/pending', authenticate, isAdmin, getPendingKYCs);
router.put('/admin/:userId/process', authenticate, isAdmin, processKYC);

export default router;
