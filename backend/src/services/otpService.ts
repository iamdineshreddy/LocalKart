import { OTP } from '../models/OTP';
import { User } from '../models/User';
import jwt from 'jsonwebtoken';

// Generate a 6-digit OTP
export const generateOTP = (): string => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP via Twilio (can also use other providers like Fast2SMS, Msg91)
export const sendOTP = async (phone: string, purpose: 'login' | 'register' | 'kyc' | 'password_reset'): Promise<{ success: boolean; message: string }> => {
    try {
        // Clean phone number
        const cleanPhone = phone.replace(/[^0-9]/g, '');
        const fullPhone = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`;

        const otp = generateOTP();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // Delete any existing OTPs for this phone
        await OTP.deleteMany({ phone: fullPhone, isVerified: false });

        // Create new OTP
        const otpRecord = new OTP({
            phone: fullPhone,
            otp,
            purpose,
            expiresAt,
            attempts: 0,
            maxAttempts: 3
        });

        await otpRecord.save();

        // In production, integrate with Twilio or other SMS provider
        // For development, log the OTP
        if (process.env.NODE_ENV === 'development') {
            console.log(`OTP for ${fullPhone}: ${otp}`);
        }

        // TODO: Integrate with Twilio
        // const client = require('twilio')(
        //   process.env.TWILIO_ACCOUNT_SID,
        //   process.env.TWILIO_AUTH_TOKEN
        // );
        // await client.messages.create({
        //   body: `Your LocalKart OTP is ${otp}. Valid for 10 minutes.`,
        //   from: process.env.TWILIO_PHONE_NUMBER,
        //   to: fullPhone
        // });

        return {
            success: true,
            message: 'OTP sent successfully'
        };
    } catch (error) {
        console.error('Error sending OTP:', error);
        return {
            success: false,
            message: 'Failed to send OTP'
        };
    }
};

// Verify OTP
export const verifyOTP = async (phone: string, otp: string, name?: string, role?: string): Promise<{ success: boolean; message: string; token?: string; user?: any; isNewUser?: boolean }> => {
    try {
        const cleanPhone = phone.replace(/[^0-9]/g, '');
        const fullPhone = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`;

        const otpRecord = await OTP.findOne({
            phone: fullPhone,
            otp,
            isVerified: false
        });

        if (!otpRecord) {
            return {
                success: false,
                message: 'Invalid OTP'
            };
        }

        if (new Date() > otpRecord.expiresAt) {
            return {
                success: false,
                message: 'OTP has expired'
            };
        }

        if (otpRecord.attempts >= otpRecord.maxAttempts) {
            return {
                success: false,
                message: 'Too many attempts. Please request a new OTP'
            };
        }

        // Mark OTP as verified
        otpRecord.isVerified = true;
        otpRecord.verifiedAt = new Date();
        await otpRecord.save();

        // Find or create user
        let user = await User.findOne({ phone: fullPhone });
        let isNewUser = false;

        if (!user) {
            // Create new user for registration
            isNewUser = true;
            const userRole = role && ['buyer', 'seller'].includes(role) ? role : 'buyer';
            user = new User({
                name: name || 'New User',
                email: `${fullPhone}@localkart.local`,
                phone: fullPhone,
                password: Math.random().toString(36).slice(-8), // Temporary password
                role: userRole,
                isVerified: true,
                kyc: {
                    userId: undefined, // Will be set after save
                    status: 'not_started'
                }
            });
            await user.save();

            // Update KYC with user ID
            user.kyc.userId = user._id;
            await user.save();
        }

        if (!user) {
            return {
                success: false,
                message: 'User not found. Please register first.'
            };
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: user._id, phone: user.phone, role: user.role },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '30d' }
        );

        return {
            success: true,
            message: 'OTP verified successfully',
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
        };
    } catch (error) {
        console.error('Error verifying OTP:', error);
        return {
            success: false,
            message: 'Error verifying OTP'
        };
    }
};

// Resend OTP
export const resendOTP = async (phone: string, purpose: 'login' | 'register' | 'kyc' | 'password_reset'): Promise<{ success: boolean; message: string }> => {
    // Check rate limiting (max 5 OTPs per hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const otpCount = await OTP.countDocuments({
        phone: phone,
        createdAt: { $gte: oneHourAgo }
    });

    if (otpCount >= 5) {
        return {
            success: false,
            message: 'Too many OTP requests. Please try again after an hour.'
        };
    }

    return sendOTP(phone, purpose);
};
