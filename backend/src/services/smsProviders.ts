// SMS Provider Service — sends OTP via Fast2SMS or 2Factor.in
// Falls back to console logging if no provider is configured (dev mode)

import axios from 'axios';

type SmsProvider = 'fast2sms' | '2factor' | 'console';

// Helper to check if a key is a real key or just the .env placeholder
const isValidKey = (key: string | undefined): boolean => {
    if (!key) return false;
    return !key.includes('your_');
};

// Auto-detect which provider to use based on env vars
const getProvider = (): SmsProvider => {
    const explicit = process.env.SMS_PROVIDER?.toLowerCase();

    if (explicit === 'fast2sms' && isValidKey(process.env.FAST2SMS_API_KEY)) return 'fast2sms';
    if (explicit === '2factor' && isValidKey(process.env.TWOFACTOR_API_KEY)) return '2factor';

    // Auto-detect from available keys
    if (isValidKey(process.env.FAST2SMS_API_KEY)) return 'fast2sms';
    if (isValidKey(process.env.TWOFACTOR_API_KEY)) return '2factor';

    return 'console';
};

// ─── Fast2SMS ────────────────────────────────────────────────
// Docs: https://docs.fast2sms.com
// Free: ₹50 credit on signup (~450 OTPs)
// Uses Quick SMS route (no DLT registration needed for testing)
const sendViaFast2SMS = async (phone: string, otp: string): Promise<boolean> => {
    try {
        const response = await axios.post(
            'https://www.fast2sms.com/dev/bulkV2',
            {
                route: 'otp',
                variables_values: otp,
                numbers: phone,
                flash: 0
            },
            {
                headers: {
                    'authorization': process.env.FAST2SMS_API_KEY!,
                    'Content-Type': 'application/json'
                }
            }
        );

        if (response.data?.return === true) {
            console.log(`[Fast2SMS] OTP sent to ${phone}`);
            return true;
        } else {
            console.error('[Fast2SMS] Failed:', response.data?.message);
            return false;
        }
    } catch (error: any) {
        console.error('[Fast2SMS] Error:', error.response?.data?.message || error.message);
        return false;
    }
};

// ─── 2Factor.in ──────────────────────────────────────────────
// Docs: https://2factor.in/v3/
// Free: 200 OTP credits on signup
// Simplest API — single GET request sends OTP
const sendVia2Factor = async (phone: string, otp: string): Promise<boolean> => {
    try {
        const apiKey = process.env.TWOFACTOR_API_KEY!;
        const url = `https://2factor.in/API/V1/${apiKey}/SMS/${phone}/${otp}/AUTOGEN`;

        const response = await axios.get(url);

        if (response.data?.Status === 'Success') {
            console.log(`[2Factor] OTP sent to ${phone}`);
            return true;
        } else {
            console.error('[2Factor] Failed:', response.data?.Details);
            return false;
        }
    } catch (error: any) {
        console.error('[2Factor] Error:', error.response?.data?.Details || error.message);
        return false;
    }
};

// ─── Console Fallback (Dev Mode) ─────────────────────────────
const sendViaConsole = async (phone: string, otp: string): Promise<boolean> => {
    console.log('');
    console.log('╔══════════════════════════════════════════╗');
    console.log(`║  📱 OTP for ${phone}: ${otp}            ║`);
    console.log('║  (No SMS provider configured — dev mode) ║');
    console.log('╚══════════════════════════════════════════╝');
    console.log('');
    return true;
};

// ─── Main Export ─────────────────────────────────────────────
export const sendSMS = async (phone: string, otp: string): Promise<boolean> => {
    // Clean phone — remove country code prefix for providers that need 10-digit
    const cleanPhone = phone.replace(/^91/, '').replace(/^\+91/, '');
    const provider = getProvider();

    switch (provider) {
        case 'fast2sms':
            return sendViaFast2SMS(cleanPhone, otp);
        case '2factor':
            return sendVia2Factor(cleanPhone, otp);
        default:
            return sendViaConsole(phone, otp);
    }
};

export const getActiveProvider = (): string => {
    return getProvider();
};
