
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
  sellerId: string;
  sellerName: string;
  unit: string;
  stock: number;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'buyer' | 'seller' | 'admin';
  phone?: string;
  isVerified?: boolean;
  kycStatus?: KYCStatus;
  aadhaarNumber?: string;
  panNumber?: string;
}

export interface KYCVerification {
  status: KYCStatus;
  aadhaarVerified: boolean;
  panVerified: boolean;
  digilockerLinked: boolean;
  documentsSubmitted: boolean;
  submittedAt?: string;
  verifiedAt?: string;
  rejectionReason?: string;
}

export enum KYCStatus {
  NOT_STARTED = 'not_started',
  PENDING = 'pending',
  SUBMITTED = 'submitted',
  VERIFIED = 'verified',
  REJECTED = 'rejected'
}

export interface OTPSession {
  phone: string;
  otp: string;
  expiresAt: Date;
  attempts: number;
}

export interface AdminApprovalRequest {
  userId: string;
  requestId?: string;
  requestTimestamp: string;
  sellerDetails: {
    storeName: string;
    address: string;
    gstin?: string;
  };
  documentsUploaded: any;
  actionTaken?: 'verified' | 'rejected';
  adminComments?: string;
  rejectionReason?: string;
}

export enum Category {
  FRUITS_VEGGIES = 'Fruits & Vegetables',
  SNACKS_MUNCHIES = 'Snacks & Munchies',
  DRINKS_JUICES = 'Drinks & Juices',
  DAIRY_BREAD = 'Dairy, Bread & Eggs',
  MEAT_FISH = 'Meat & Fish',
  PERSONAL_CARE = 'Personal Care',
  HOME_OFFICE = 'Home & Office',
  PANTRY = 'Atta, Rice & Dal'
}

// Types previously defined inline in App.tsx
export interface Address {
  id: string;
  label: string;
  fullAddress: string;
  isDefault: boolean;
}

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  date: string;
  status: 'packed' | 'shipping' | 'delivered';
  address: string;
  paymentMethod: 'online' | 'cod';
  paymentStatus: 'paid' | 'pending' | 'failed';
  paymentId?: string;
}
