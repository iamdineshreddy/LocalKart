import rateLimit from 'express-rate-limit';

// General API request limiter
export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many requests from this IP, please try again after 15 minutes' }
});

// Stricter limiter for auth endpoints (login, signup, OTP)
export const authLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // Limit each IP to 10 requests per `window` (here, per hour)
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many login attempts from this IP, please try again after an hour' }
});
