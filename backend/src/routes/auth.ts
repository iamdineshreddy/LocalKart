import { Router } from 'express';
import {
    requestOTP,
    verifyOTPAndLogin,
    resendOTPHandler,
    getCurrentUser,
    updateProfile,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    updateLocation,
    verifyFirebaseToken
} from '../controllers/authController';
import { authenticate } from '../middleware/auth';

const router = Router();

// OTP routes (fallback/dev)
router.post('/otp/request', requestOTP);
router.post('/otp/verify', verifyOTPAndLogin);
router.post('/otp/resend', resendOTPHandler);

// Firebase Phone Auth route
router.post('/firebase-verify', verifyFirebaseToken);

// User routes
router.get('/me', authenticate, getCurrentUser);
router.put('/profile', authenticate, updateProfile);
router.put('/location', authenticate, updateLocation);

// Address routes
router.post('/addresses', authenticate, addAddress);
router.put('/addresses/:addressId', authenticate, updateAddress);
router.delete('/addresses/:addressId', authenticate, deleteAddress);
router.put('/addresses/default', authenticate, setDefaultAddress);

export default router;

