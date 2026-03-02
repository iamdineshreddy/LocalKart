import { Request, Response } from 'express';
import { User } from '../models/User';
import { sendOTP, verifyOTP, resendOTP } from '../services/otpService';
import jwt from 'jsonwebtoken';
import { verifyFirebaseIdToken } from '../config/firebaseAdmin';

// Request OTP for login/register
export const requestOTP = async (req: Request, res: Response): Promise<void> => {
    try {
        const { phone, purpose = 'login' } = req.body;

        if (!phone) {
            res.status(400).json({ success: false, message: 'Phone number is required' });
            return;
        }

        const result = await sendOTP(phone, purpose);

        if (result.success) {
            res.status(200).json({
                success: true,
                message: result.message
            });
        } else {
            res.status(400).json({
                success: false,
                message: result.message
            });
        }
    } catch (error) {
        console.error('Request OTP error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Verify OTP and login/register
export const verifyOTPAndLogin = async (req: Request, res: Response): Promise<void> => {
    try {
        const { phone, otp, name, role } = req.body;

        if (!phone || !otp) {
            res.status(400).json({ success: false, message: 'Phone and OTP are required' });
            return;
        }

        const result = await verifyOTP(phone, otp, name, role);

        if (result.success) {
            res.status(200).json({
                success: true,
                message: result.message,
                token: result.token,
                user: result.user,
                isNewUser: result.isNewUser
            });
        } else {
            res.status(400).json({
                success: false,
                message: result.message
            });
        }
    } catch (error) {
        console.error('Verify OTP error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Resend OTP
export const resendOTPHandler = async (req: Request, res: Response): Promise<void> => {
    try {
        const { phone, purpose = 'login' } = req.body;

        if (!phone) {
            res.status(400).json({ success: false, message: 'Phone number is required' });
            return;
        }

        const result = await resendOTP(phone, purpose);

        if (result.success) {
            res.status(200).json({
                success: true,
                message: result.message
            });
        } else {
            res.status(400).json({
                success: false,
                message: result.message
            });
        }
    } catch (error) {
        console.error('Resend OTP error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Get current user
export const getCurrentUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user?.id;

        const user = await User.findById(userId).select('-password');

        if (!user) {
            res.status(404).json({ success: false, message: 'User not found' });
            return;
        }

        res.status(200).json({
            success: true,
            user
        });
    } catch (error) {
        console.error('Get current user error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Update user profile
export const updateProfile = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user?.id;
        const { name, email, profileImage } = req.body;

        const user = await User.findByIdAndUpdate(
            userId,
            { name, email, profileImage },
            { new: true }
        ).select('-password');

        res.status(200).json({
            success: true,
            user
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Add address
export const addAddress = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user?.id;
        const { label, fullAddress, city, state, pincode, latitude, longitude, landmark, isDefault } = req.body;

        const address = {
            label,
            fullAddress,
            city,
            state,
            pincode,
            location: {
                type: 'Point' as const,
                coordinates: [longitude, latitude]
            },
            landmark,
            isDefault: isDefault || false
        };

        // If setting as default, unset other defaults
        if (isDefault) {
            await User.updateOne(
                { _id: userId, 'addresses.isDefault': true },
                { $set: { 'addresses.$[].isDefault': false } }
            );
        }

        const user = await User.findByIdAndUpdate(
            userId,
            { $push: { addresses: address } },
            { new: true }
        ).select('-password');

        res.status(200).json({
            success: true,
            message: 'Address added successfully',
            user
        });
    } catch (error) {
        console.error('Add address error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Update address
export const updateAddress = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user?.id;
        const { addressId } = req.params;
        const updates = req.body;

        const user = await User.findOneAndUpdate(
            { _id: userId, 'addresses._id': addressId },
            { $set: { 'addresses.$': { ...updates, _id: addressId } } },
            { new: true }
        ).select('-password');

        res.status(200).json({
            success: true,
            message: 'Address updated successfully',
            user
        });
    } catch (error) {
        console.error('Update address error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Delete address
export const deleteAddress = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user?.id;
        const { addressId } = req.params;

        const user = await User.findByIdAndUpdate(
            userId,
            { $pull: { addresses: { _id: addressId } } },
            { new: true }
        ).select('-password');

        res.status(200).json({
            success: true,
            message: 'Address deleted successfully',
            user
        });
    } catch (error) {
        console.error('Delete address error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Set default address
export const setDefaultAddress = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user?.id;
        const { addressId } = req.body;

        // Unset all defaults
        await User.updateOne(
            { _id: userId, 'addresses.isDefault': true },
            { $set: { 'addresses.$[].isDefault': false } }
        );

        // Set new default
        const user = await User.findOneAndUpdate(
            { _id: userId, 'addresses._id': addressId },
            { $set: { 'addresses.$.isDefault': true, defaultAddress: addressId } },
            { new: true }
        ).select('-password');

        res.status(200).json({
            success: true,
            message: 'Default address updated',
            user
        });
    } catch (error) {
        console.error('Set default address error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Update user location
export const updateLocation = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user?.id;
        const { latitude, longitude } = req.body;

        const user = await User.findByIdAndUpdate(
            userId,
            {
                location: {
                    type: 'Point',
                    coordinates: [longitude, latitude]
                }
            },
            { new: true }
        ).select('-password');

        res.status(200).json({
            success: true,
            message: 'Location updated',
            user
        });
    } catch (error) {
        console.error('Update location error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Verify Firebase ID Token and login/register
export const verifyFirebaseToken = async (req: Request, res: Response): Promise<void> => {
    try {
        const { idToken, name, role } = req.body;

        if (!idToken) {
            res.status(400).json({ success: false, message: 'Firebase ID token is required' });
            return;
        }

        // Verify the Firebase ID token
        const decodedToken = await verifyFirebaseIdToken(idToken);
        const firebasePhone = decodedToken.phone_number;

        if (!firebasePhone) {
            res.status(400).json({ success: false, message: 'Phone number not found in Firebase token' });
            return;
        }

        // Normalize phone (remove + prefix if present)
        const cleanPhone = firebasePhone.replace(/^\+/, '');

        // Find or create user
        let user = await User.findOne({ phone: cleanPhone });
        let isNewUser = false;

        if (!user) {
            isNewUser = true;
            const userRole = role && ['buyer', 'seller'].includes(role) ? role : 'buyer';
            user = new User({
                name: name || 'New User',
                email: `${cleanPhone}@localkart.local`,
                phone: cleanPhone,
                password: Math.random().toString(36).slice(-8),
                role: userRole,
                isVerified: true,
                kyc: {
                    userId: undefined,
                    status: 'not_started'
                }
            });
            await user.save();
            user.kyc.userId = user._id;
            await user.save();
        }

        // Generate app JWT token
        const token = jwt.sign(
            { id: user._id, phone: user.phone, role: user.role },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '30d' }
        );

        res.status(200).json({
            success: true,
            message: 'Firebase authentication successful',
            token,
            isNewUser,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                isVerified: user.isVerified
            }
        });
    } catch (error: any) {
        console.error('Firebase verify error:', error);
        if (error.code === 'auth/id-token-expired') {
            res.status(401).json({ success: false, message: 'Token expired. Please try again.' });
        } else if (error.code === 'auth/argument-error') {
            res.status(400).json({ success: false, message: 'Invalid token format' });
        } else {
            res.status(500).json({ success: false, message: 'Authentication failed' });
        }
    }
};
