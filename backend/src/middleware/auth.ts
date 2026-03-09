import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { getJwtSecret } from '../config/jwt';

interface AuthRequest extends Request {
    user?: any;
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ success: false, message: 'No token provided' });
            return;
        }

        const token = authHeader.split(' ')[1];

        const decoded = jwt.verify(token, getJwtSecret()) as any;

        const user = await User.findById(decoded.id);

        if (!user) {
            res.status(401).json({ success: false, message: 'User not found' });
            return;
        }

        if (!user.isActive) {
            res.status(401).json({ success: false, message: 'Account is deactivated' });
            return;
        }

        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ success: false, message: 'Invalid token' });
    }
};

// Optional authentication - doesn't fail if no token
export const optionalAuth = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            next();
            return;
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, getJwtSecret()) as any;

        const user = await User.findById(decoded.id);
        if (user && user.isActive) {
            req.user = decoded;
        }

        next();
    } catch (error) {
        // Continue without authentication
        next();
    }
};

// Check if user is admin
export const isAdmin = (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (req.user?.role !== 'admin') {
        res.status(403).json({ success: false, message: 'Admin access required' });
        return;
    }
    next();
};

// Check if user is seller
export const isSeller = (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!['seller', 'admin'].includes(req.user?.role)) {
        res.status(403).json({ success: false, message: 'Seller access required' });
        return;
    }
    next();
};

// Check if user is verified (phone verified)
export const isVerified = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const user = await User.findById(req.user?.id);
        if (!user || !user.isVerified) {
            res.status(403).json({ success: false, message: 'Please verify your phone number' });
            return;
        }
        next();
    } catch (error) {
        res.status(500).json({ success: false, message: 'Verification check failed' });
    }
};

// Check if KYC is completed
export const hasKYC = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const user = await User.findById(req.user?.id);

        if (!user || user.kyc.status !== 'verified') {
            res.status(403).json({ success: false, message: 'KYC verification required' });
            return;
        }

        next();
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
