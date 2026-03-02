import axios from 'axios';
import { User } from '../models/User';

const DIGILOCKER_BASE_URL = 'https://api.digilocker.gov.in/public';
const DIGILOCKER_AUTH_URL = 'https://auth.digilocker.gov.in/oauth/v2';

// Generate Digilocker authorization URL
export const getDigilockerAuthUrl = (userId: string): string => {
    const clientId = process.env.DIGILOCKER_CLIENT_ID;
    const redirectUri = process.env.DIGILOCKER_REDIRECT_URI;

    const state = Buffer.from(JSON.stringify({ userId })).toString('base64');

    return `${DIGILOCKER_AUTH_URL}/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&state=${state}&purpose=ekyc`;
};

// Handle Digilocker OAuth callback
export const handleDigilockerCallback = async (code: string, state: string): Promise<{ success: boolean; message: string; documents?: any }> => {
    try {
        // Decode state to get userId
        const { userId } = JSON.parse(Buffer.from(state, 'base64').toString());

        // Exchange code for access token
        const tokenResponse = await axios.post(`${DIGILOCKER_AUTH_URL}/token`,
            new URLSearchParams({
                client_id: process.env.DIGILOCKER_CLIENT_ID || '',
                client_secret: process.env.DIGILOCKER_CLIENT_SECRET || '',
                code,
                grant_type: 'authorization_code',
                redirect_uri: process.env.DIGILOCKER_REDIRECT_URI || ''
            }),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );

        const { access_token, refresh_token } = tokenResponse.data;

        // Get user documents from Digilocker
        const documents = await getDigilockerDocuments(access_token);

        // Update user KYC status
        await User.findByIdAndUpdate(userId, {
            'kyc.digilockerLinked': true,
            'kyc.digilockerAccessToken': access_token,
            'kyc.status': 'submitted'
        });

        return {
            success: true,
            message: 'Digilocker linked successfully',
            documents
        };
    } catch (error) {
        console.error('Digilocker callback error:', error);
        return {
            success: false,
            message: 'Failed to link Digilocker account'
        };
    }
};

// Get documents from Digilocker
export const getDigilockerDocuments = async (accessToken: string): Promise<any> => {
    try {
        // Get Aadhaar details
        const aadhaarResponse = await axios.get(`${DIGILOCKER_BASE_URL}/documents/aadhaar`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Accept': 'application/json'
            }
        });

        // Get PAN details
        const panResponse = await axios.get(`${DIGILOCKER_BASE_URL}/documents/pan`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Accept': 'application/json'
            }
        });

        return {
            aadhaar: aadhaarResponse.data,
            pan: panResponse.data
        };
    } catch (error) {
        console.error('Error fetching Digilocker documents:', error);
        return null;
    }
};

// Verify Aadhaar number
export const verifyAadhaar = async (aadhaarNumber: string): Promise<{ success: boolean; message: string; details?: any }> => {
    try {
        // In production, use official UIDAI API
        // This is a simplified version

        // Validate Aadhaar format
        if (!/^\d{12}$/.test(aadhaarNumber)) {
            return {
                success: false,
                message: 'Invalid Aadhaar number format'
            };
        }

        // TODO: Integrate with UIDAI API for real verification
        // const response = await axios.post('https://api.uidai.gov.in/uidapi/2.0/auth/uid', {...});

        return {
            success: true,
            message: 'Aadhaar verification initiated',
            details: {
                maskedNumber: `${aadhaarNumber.substring(0, 4)}XXXX${aadhaarNumber.substring(8)}`
            }
        };
    } catch (error) {
        return {
            success: false,
            message: 'Aadhaar verification failed'
        };
    }
};

// Verify PAN number
export const verifyPAN = async (panNumber: string): Promise<{ success: boolean; message: string; details?: any }> => {
    try {
        // Validate PAN format
        if (!/^[A-Z]{5}\d{4}[A-Z]{1}$/.test(panNumber.toUpperCase())) {
            return {
                success: false,
                message: 'Invalid PAN number format'
            };
        }

        // TODO: Integrate with NSDL or UTIITSL API for real verification

        return {
            success: true,
            message: 'PAN verification initiated',
            details: {
                maskedPAN: panNumber.toUpperCase().substring(0, 5) + 'XXXX' + panNumber.toUpperCase().substring(9)
            }
        };
    } catch (error) {
        return {
            success: false,
            message: 'PAN verification failed'
        };
    }
};

// Submit KYC documents for manual verification
export const submitKYC = async (
    userId: string,
    aadhaarNumber: string,
    panNumber: string,
    aadhaarDocUrl?: string,
    panDocUrl?: string
): Promise<{ success: boolean; message: string }> => {
    try {
        // Verify documents
        const aadhaarResult = await verifyAadhaar(aadhaarNumber);
        const panResult = await verifyPAN(panNumber);

        if (!aadhaarResult.success || !panResult.success) {
            return {
                success: false,
                message: 'Document verification failed'
            };
        }

        // Update user KYC
        await User.findByIdAndUpdate(userId, {
            'kyc.aadhaarNumber': aadhaarNumber,
            'kyc.aadhaarVerified': true,
            'kyc.panNumber': panNumber,
            'kyc.panVerified': true,
            'kyc.documentsSubmitted': true,
            'kyc.submittedAt': new Date(),
            'kyc.status': 'pending'
        });

        return {
            success: true,
            message: 'KYC documents submitted successfully'
        };
    } catch (error) {
        console.error('KYC submission error:', error);
        return {
            success: false,
            message: 'Failed to submit KYC'
        };
    }
};

// Admin approve/reject KYC
export const processKYCApproval = async (
    userId: string,
    action: 'verified' | 'rejected',
    rejectionReason?: string
): Promise<{ success: boolean; message: string }> => {
    try {
        const updateData: any = {
            'kyc.status': action,
            'kyc.verifiedAt': action === 'verified' ? new Date() : undefined,
            'kyc.rejectionReason': rejectionReason
        };

        await User.findByIdAndUpdate(userId, updateData);

        return {
            success: true,
            message: action === 'verified' ? 'KYC verified successfully' : 'KYC rejected'
        };
    } catch (error) {
        return {
            success: false,
            message: 'Failed to process KYC'
        };
    }
};
