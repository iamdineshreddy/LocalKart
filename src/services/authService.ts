// Advanced Authentication Service with OTP and KYC Verification
// Simulates Digilocker integration for Aadhaar/PAN verification

import { User, OTPSession, KYCStatus } from '../types';

// Mock OTP storage (in production, use Redis or similar)
const otpStore: Map<string, OTPSession> = new Map();

// Helper function to simulate network delay
const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// Generate 6-digit OTP
export const generateOTP = async (phone: string): Promise<string> => {
  await delay(500);
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Store OTP session
  otpStore.set(phone, {
    phone,
    otp,
    expiresAt: new Date(Date.now() + 5 * 60 * 1000), // Expires in 5 minutes
    attempts: 0
  });
  
  console.log(`[MOCK SMS] OTP for ${phone}: ${otp}`);
  return otp;
};

// Verify OTP
export const verifyOTP = async (phone: string, inputOtp: string): Promise<boolean> => {
  await delay(500);
  const session = otpStore.get(phone);
  
  if (!session) {
    throw new Error('No OTP request found for this number');
  }
  
  if (new Date() > session.expiresAt) {
    otpStore.delete(phone);
    throw new Error('OTP has expired');
  }
  
  if (session.attempts >= 3) {
    otpStore.delete(phone);
    throw new Error('Too many incorrect attempts. Please request a new OTP');
  }
  
  if (inputOtp === session.otp) {
    otpStore.delete(phone);
    return true;
  }
  
  session.attempts++;
  return false;
};

// Resend OTP
export const resendOTP = async (phone: string): Promise<string> => {
  otpStore.delete(phone);
  return generateOTP(phone);
};

// Digilocker Integration Simulation
interface DigilockerResponse {
  success: boolean;
  linked: boolean;
  documents?: string[];
  error?: string;
}

export const initiateDigilockerAuth = async (): Promise<DigilockerResponse> => {
  // Simulate Digilocker OAuth flow
  await delay(1500);
  return {
    success: true,
    linked: true,
    documents: ['Aadhaar Card', 'PAN Card']
  };
};

// Document Verification
interface DocumentVerificationResult {
  success: boolean;
  docVerified: boolean;
  documentType: 'aadhaar' | 'pan';
  documentNumber?: string;
  verifiedAt: string;
}

export const verifyDocumentWithDigilocker = async (
  documentType: 'aadhaar' | 'pan',
  documentNumber?: string
): Promise<DocumentVerificationResult> => {
  await delay(2000);
  
  if (documentType === 'aadhaar') {
    return {
      success: true,
      docVerified: true,
      documentType: 'aadhaar',
      documentNumber: documentNumber || 'XXXX-XXXX-XXXX',
      verifiedAt: new Date().toISOString()
    };
  } else {
    return {
      success: true,
      docVerified: true,
      documentType: 'pan',
      documentNumber: documentNumber || 'XXXXXXXXXX',
      verifiedAt: new Date().toISOString()
    };
  }
};

// KYC Document Upload
interface KYCDocumentUpload {
  uploadedFiles: {
    type: 'aadhaarFront' | 'aadharBack' | 'panCard';
    url: string;
    name: string;
  }[];
  uploadTimestamp: string;
}

const kycUploads: Map<string, KYCDocumentUpload> = new Map();

export const uploadKYCDocuments = async (
  userId: string,
  files: KYCDocumentUpload['uploadedFiles']
): Promise<{ success: boolean; message: string }> => {
  await delay(1500);
  
  kycUploads.set(userId, {
    uploadedFiles: files,
    uploadTimestamp: new Date().toISOString()
  });
  
  return {
    success: true,
    message: 'Documents uploaded successfully'
  };
};

export const getKYCStatus = (userId: string): KYCStatus => {
  const upload = kycUploads.get(userId);
  if (!upload) return KYCStatus.NOT_STARTED;
  
  // Simulate verification status
  return KYCStatus.PENDING;
};

// Seller Approval Workflow
interface AdminApprovalRequest {
  userId: string;
  requestTimestamp: string;
  sellerDetails: {
    storeName: string;
    address: string;
    gstin?: string;
  };
  documentsUploaded: KYCDocumentUpload;
  actionTaken?: 'verified' | 'rejected';
  adminComments?: string;
  rejectionReason?: string;
}

const approvalRequests: Map<string, AdminApprovalRequest> = new Map();

export const requestSellerApproval = async (
  request: Omit<AdminApprovalRequest, 'actionTaken' | 'adminComments'>
): Promise<{ success: boolean; requestId: string }> => {
  await delay(1000);
  
  const requestId = Math.random().toString(36).substr(2, 9).toUpperCase();
  approvalRequests.set(requestId, {
    ...request,
    requestId,
    actionTaken: undefined,
    adminComments: ''
  });
  
  return {
    success: true,
    requestId
  };
};

export const approveSeller = async (
  requestId: string,
  comments: string = ''
): Promise<{ success: boolean }> => {
  await delay(800);
  
  const existingReq = approvalRequests.get(requestId);
  if (existingReq) {
    const updatedReq = {
      ...existingReq,
      actionTaken: 'verified' as const,
      adminComments: comments,
      requestTimestamp: new Date().toISOString()
    };
    approvalRequests.set(requestId, updatedReq);
  }
  
  return { success: true };
};

export const rejectSeller = async (
  requestId: string,
  reason: string
): Promise<{ success: boolean }> => {
  await delay(800);
  
  const existingReq = approvalRequests.get(requestId);
  if (existingReq) {
    const updatedReq = {
      ...existingReq,
      actionTaken: 'rejected' as const,
      rejectionReason: reason,
      requestTimestamp: new Date().toISOString()
    };
    approvalRequests.set(requestId, updatedReq);
  }
  
  return { success: true };
};

export const getSellerApprovalStatus = (requestId: string): AdminApprovalRequest | undefined => {
  return approvalRequests.get(requestId);
};

// Check if user is verified
export const isUserVerified = async (phone: string): Promise<boolean> => {
  await delay(300);
  // In production, check against database
  return true;
};

// Export all functions as authService object for easier imports
export default {
  generateOTP,
  verifyOTP,
  resendOTP,
  initiateDigilockerAuth,
  verifyDocumentWithDigilocker,
  uploadKYCDocuments,
  getKYCStatus,
  requestSellerApproval,
  approveSeller,
  rejectSeller,
  getSellerApprovalStatus,
  isUserVerified
};
