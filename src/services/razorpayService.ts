// Razorpay Payment Service (Test Mode)
// No real charges — uses test key for development
// Test card: 4111 1111 1111 1111, any CVV, any future expiry
// Test UPI: success@razorpay

declare global {
    interface Window {
        Razorpay: any;
    }
}

// Razorpay test key — replace with live key for production
const RAZORPAY_KEY_ID = 'rzp_test_SMT1XI6sdyhuQy';

// Dynamically load Razorpay script
const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
        if (window.Razorpay) {
            resolve(true);
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
};

export interface RazorpayResponse {
    razorpay_payment_id: string;
    razorpay_order_id?: string;
    razorpay_signature?: string;
}

export interface PaymentOptions {
    amount: number; // in rupees (will be converted to paise)
    orderId?: string;
    customerName?: string;
    customerEmail?: string;
    customerPhone?: string;
    description?: string;
}

export const openRazorpayCheckout = async (
    options: PaymentOptions
): Promise<RazorpayResponse> => {
    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
        throw new Error('Failed to load Razorpay. Please check your internet connection.');
    }

    return new Promise((resolve, reject) => {
        const rzp = new window.Razorpay({
            key: RAZORPAY_KEY_ID,
            amount: options.amount * 100, // Convert to paise
            currency: 'INR',
            name: 'LocalKart',
            description: options.description || 'Order Payment',
            image: '', // Can add logo URL
            prefill: {
                name: options.customerName || '',
                email: options.customerEmail || '',
                contact: options.customerPhone || '',
            },
            theme: {
                color: '#1e3a5f', // Blue-900 to match app theme
                backdrop_color: 'rgba(0,0,0,0.6)',
            },
            modal: {
                ondismiss: () => {
                    reject(new Error('Payment cancelled'));
                },
                confirm_close: true,
                animation: true,
            },
            handler: (response: RazorpayResponse) => {
                resolve(response);
            },
        });

        rzp.on('payment.failed', (response: any) => {
            reject(new Error(response.error?.description || 'Payment failed'));
        });

        rzp.open();
    });
};

export default { openRazorpayCheckout };
