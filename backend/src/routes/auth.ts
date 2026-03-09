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
    verifyFirebaseToken,
    emailSignup,
    emailLogin,
    seedTestUsers,
} from '../controllers/authController';
import { authenticate } from '../middleware/auth';
import { authLimiter } from '../middleware/rateLimiter';
import { loginValidation, signupValidation } from '../middleware/validate';

const router = Router();

// Public auth routes (with rate limiting and validation)
router.post('/otp/request', authLimiter, requestOTP);
router.post('/otp/verify', authLimiter, verifyOTPAndLogin);
router.post('/otp/resend', authLimiter, resendOTPHandler);

router.post('/firebase/verify', authLimiter, verifyFirebaseToken);

router.post('/signup', authLimiter, signupValidation, emailSignup);
router.post('/login', authLimiter, loginValidation, emailLogin);

// Seed test users (dev only)
router.post('/seed', seedTestUsers);

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
