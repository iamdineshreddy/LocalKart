const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ApiService {
    private token: string | null = null;

    constructor() {
        this.token = localStorage.getItem('token');
    }

    setToken(token: string | null) {
        this.token = token;
        if (token) {
            localStorage.setItem('token', token);
        } else {
            localStorage.removeItem('token');
        }
    }

    private async request(endpoint: string, options: RequestInit = {}) {
        const url = `${API_BASE_URL}${endpoint}`;

        const headers: HeadersInit = {
            'Content-Type': 'application/json',
            ...options.headers,
        };

        if (this.token) {
            (headers as Record<string, string>)['Authorization'] = `Bearer ${this.token}`;
        }

        try {
            const response = await fetch(url, { ...options, headers });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Something went wrong');
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // Auth endpoints
    async requestOTP(phone: string, purpose: string = 'login') {
        return this.request('/auth/otp/request', {
            method: 'POST',
            body: JSON.stringify({ phone, purpose }),
        });
    }

    async verifyOTP(phone: string, otp: string, name?: string, role?: string) {
        const data = await this.request('/auth/otp/verify', {
            method: 'POST',
            body: JSON.stringify({ phone, otp, name, role }),
        });
        if (data.token) {
            this.setToken(data.token);
        }
        return data;
    }

    async resendOTP(phone: string, purpose: string = 'login') {
        return this.request('/auth/otp/resend', {
            method: 'POST',
            body: JSON.stringify({ phone, purpose }),
        });
    }

    async verifyFirebaseToken(idToken: string, name?: string, role?: string) {
        const data = await this.request('/auth/firebase-verify', {
            method: 'POST',
            body: JSON.stringify({ idToken, name, role }),
        });
        if (data.token) {
            this.setToken(data.token);
        }
        return data;
    }

    async getCurrentUser() {
        return this.request('/auth/me');
    }

    async emailSignup(data: { name: string; email: string; password: string; phone?: string; role?: string }) {
        const result = await this.request('/auth/signup', {
            method: 'POST',
            body: JSON.stringify(data),
        });
        if (result.token) {
            this.setToken(result.token);
        }
        return result;
    }

    async emailLogin(email: string, password: string) {
        const result = await this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
        if (result.token) {
            this.setToken(result.token);
        }
        return result;
    }

    async seedTestUsers() {
        return this.request('/auth/seed-test-users', { method: 'POST' });
    }

    async updateProfile(data: { name?: string; email?: string; profileImage?: string }) {
        return this.request('/auth/profile', {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    async updateLocation(latitude: number, longitude: number) {
        return this.request('/auth/location', {
            method: 'PUT',
            body: JSON.stringify({ latitude, longitude }),
        });
    }

    // Address endpoints
    async addAddress(address: {
        label: string;
        fullAddress: string;
        city: string;
        state: string;
        pincode: string;
        latitude: number;
        longitude: number;
        landmark?: string;
        isDefault?: boolean;
    }) {
        return this.request('/auth/addresses', {
            method: 'POST',
            body: JSON.stringify(address),
        });
    }

    async updateAddress(addressId: string, address: any) {
        return this.request(`/auth/addresses/${addressId}`, {
            method: 'PUT',
            body: JSON.stringify(address),
        });
    }

    async deleteAddress(addressId: string) {
        return this.request(`/auth/addresses/${addressId}`, {
            method: 'DELETE',
        });
    }

    async setDefaultAddress(addressId: string) {
        return this.request('/auth/addresses/default', {
            method: 'PUT',
            body: JSON.stringify({ addressId }),
        });
    }

    // KYC endpoints
    async initiateDigilocker() {
        return this.request('/kyc/digilocker/initiate');
    }

    async submitKYC(data: { aadhaarNumber: string; panNumber: string }) {
        return this.request('/kyc/submit', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async getKYCStatus() {
        return this.request('/kyc/status');
    }

    async verifyAadhaar(aadhaarNumber: string) {
        return this.request('/kyc/verify/aadhaar', {
            method: 'POST',
            body: JSON.stringify({ aadhaarNumber }),
        });
    }

    async verifyPAN(panNumber: string) {
        return this.request('/kyc/verify/pan', {
            method: 'POST',
            body: JSON.stringify({ panNumber }),
        });
    }

    // Order endpoints
    async createOrder(orderData: any) {
        return this.request('/orders', {
            method: 'POST',
            body: JSON.stringify(orderData),
        });
    }

    async getMyOrders() {
        return this.request('/orders/me');
    }

    // Store endpoints
    async getNearbyStores(latitude: number, longitude: number, limit: number = 10) {
        return this.request(`/stores/nearby?latitude=${latitude}&longitude=${longitude}&limit=${limit}`);
    }

    async getStoreDetails(storeId: string) {
        return this.request(`/stores/${storeId}`);
    }


    async getNearbyProducts(latitude: number, longitude: number, category?: string) {
        let url = `/stores/products?latitude=${latitude}&longitude=${longitude}`;
        if (category) url += `&category=${category}`;
        return this.request(url);
    }

    // Product endpoints
    async searchProducts(params: {
        q?: string;
        latitude: number;
        longitude: number;
        category?: string;
        minPrice?: number;
        maxPrice?: number;
        rating?: number;
        page?: number;
        limit?: number;
    }) {
        const queryParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined) queryParams.append(key, String(value));
        });
        return this.request(`/products/search?${queryParams}`);
    }

    async getSuggestions(q: string) {
        return this.request(`/products/suggestions?q=${encodeURIComponent(q)}`);
    }

    async getRecommendations(latitude: number, longitude: number) {
        return this.request(`/products/recommendations?latitude=${latitude}&longitude=${longitude}`);
    }

    async getTrending(latitude: number, longitude: number) {
        return this.request(`/products/trending?latitude=${latitude}&longitude=${longitude}`);
    }

    async getProductDetails(productId: string) {
        return this.request(`/products/${productId}`);
    }

    async getPriceRecommendations(name: string, category: string, latitude: number, longitude: number) {
        return this.request(`/products/price-recommendations?name=${name}&category=${category}&latitude=${latitude}&longitude=${longitude}`);
    }

    // Seller endpoints
    async createStore(data: any) {
        return this.request('/stores', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async updateStore(data: any) {
        return this.request('/stores', {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    async getMyStore() {
        return this.request('/stores/me/my-store');
    }

    async createProduct(data: any) {
        return this.request('/products', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async updateProduct(productId: string, data: any) {
        return this.request(`/products/${productId}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    async deleteProduct(productId: string) {
        return this.request(`/products/${productId}`, {
            method: 'DELETE',
        });
    }

    async getMyProducts(page: number = 1, limit: number = 20) {
        return this.request(`/products/seller/my-products?page=${page}&limit=${limit}`);
    }

    // Admin endpoints
    async adminLogin(email: string, password: string) {
        const data = await this.request('/admin/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
        if (data.token) {
            this.setToken(data.token);
        }
        return data;
    }

    async getDashboardStats() {
        return this.request('/admin/dashboard');
    }

    async getAdminSellers(page: number = 1, limit: number = 20, status?: string) {
        let url = `/admin/sellers?page=${page}&limit=${limit}`;
        if (status && status !== 'all') url += `&status=${status}`;
        return this.request(url);
    }

    async approveSeller(storeId: string) {
        return this.request(`/admin/sellers/${storeId}/approve`, { method: 'PUT' });
    }

    async rejectSeller(storeId: string, reason?: string) {
        return this.request(`/admin/sellers/${storeId}/reject`, {
            method: 'PUT',
            body: JSON.stringify({ reason }),
        });
    }

    async getAdminProducts(page: number = 1, limit: number = 20, status?: string) {
        let url = `/admin/products?page=${page}&limit=${limit}`;
        if (status && status !== 'all') url += `&status=${status}`;
        return this.request(url);
    }

    async toggleProduct(productId: string, isActive: boolean) {
        return this.request(`/admin/products/${productId}/toggle`, {
            method: 'PUT',
            body: JSON.stringify({ isActive }),
        });
    }

    // AI Content Proxy
    async generateAIContent(prompt: string, type: 'product_description' | 'recipe_idea') {
        return this.request('/assistant/generate', {
            method: 'POST',
            body: JSON.stringify({ prompt, type }),
        });
    }

    // Logout
    logout() {
        this.setToken(null);
    }
}

export const api = new ApiService();
export default api;
