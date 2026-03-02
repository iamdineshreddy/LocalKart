import { Request, Response } from 'express';
import { User } from '../models/User';
import {
    getDigilockerAuthUrl,
    handleDigilockerCallback,
    submitKYC,
    processKYCApproval,
    verifyAadhaar,
    verifyPAN
} from '../services/digilockerService';

// Initiate Digilocker linking
export const initiateDigilocker = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user?.id;

        const authUrl = getDigilockerAuthUrl(userId);

        res.status(200).json({
            success: true,
            authUrl
        });
    } catch (error) {
        console.error('Initiate Digilocker error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Handle Digilocker OAuth callback
export const handleDigilockerCallbackController = async (req: Request, res: Response): Promise<void> => {
    try {
        const { code, state } = req.query;

        if (!code || !state) {
            res.status(400).json({ success: false, message: 'Missing parameters' });
            return;
        }

        const result = await handleDigilockerCallback(code as string, state as string);

        if (result.success) {
            res.redirect(`${process.env.FRONTEND_URL}/kyc/success`);
        } else {
            res.redirect(`${process.env.FRONTEND_URL}/kyc/error?message=${result.message}`);
        }
    } catch (error) {
        console.error('Digilocker callback error:', error);
        res.redirect(`${process.env.FRONTEND_URL}/kyc/error?message=Authentication failed`);
    }
};

// Submit KYC manually
export const submitKYCDocuments = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user?.id;
        const { aadhaarNumber, panNumber, aadhaarDocUrl, panDocUrl } = req.body;

        if (!aadhaarNumber || !panNumber) {
            res.status(400).json({ success: false, message: 'Aadhaar and PAN numbers are required' });
            return;
        }

        const result = await submitKYC(userId, aadhaarNumber, panNumber, aadhaarDocUrl, panDocUrl);

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
        console.error('Submit KYC error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Get KYC status
export const getKYCStatus = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user?.id;

        const user = await User.findById(userId).select('kyc');

        if (!user) {
            res.status(404).json({ success: false, message: 'User not found' });
            return;
        }

        res.status(200).json({
            success: true,
            kyc: user.kyc
        });
    } catch (error) {
        console.error('Get KYC status error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Verify Aadhaar (initiate)
export const verifyAadhaarController = async (req: Request, res: Response): Promise<void> => {
    try {
        const { aadhaarNumber } = req.body;

        if (!aadhaarNumber) {
            res.status(400).json({ success: false, message: 'Aadhaar number is required' });
            return;
        }

        const result = await verifyAadhaar(aadhaarNumber);

        res.status(200).json(result);
    } catch (error) {
        console.error('Verify Aadhaar error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Verify PAN (initiate)
export const verifyPANController = async (req: Request, res: Response): Promise<void> => {
    try {
        const { panNumber } = req.body;

        if (!panNumber) {
            res.status(400).json({ success: false, message: 'PAN number is required' });
            return;
        }

        const result = await verifyPAN(panNumber);

        res.status(200).json(result);
    } catch (error) {
        console.error('Verify PAN error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Admin: Get all KYC pending users
export const getPendingKYCs = async (req: Request, res: Response): Promise<void> => {
    try {
        const users = await User.find({
            'kyc.status': 'submitted'
        }).select('name email phone kyc createdAt');

        res.status(200).json({
            success: true,
            users
        });
    } catch (error) {
        console.error('Get pending KYCs error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Admin: Approve or reject KYC
export const processKYC = async (req: Request, res: Response): Promise<void> => {
    try {
        const { userId } = req.params;
        const { action, rejectionReason } = req.body;

        if (!action || !['verified', 'rejected'].includes(action)) {
            res.status(400).json({ success: false, message: 'Invalid action' });
            return;
        }

        const result = await processKYCApproval(userId, action, rejectionReason);

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
        console.error('Process KYC error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
