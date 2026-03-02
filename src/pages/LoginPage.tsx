import React, { useState, useEffect, useRef } from 'react';
import { User as UserType } from '../types';
import api from '../services/api';
import { auth, RecaptchaVerifier, signInWithPhoneNumber, isFirebaseConfigured } from '../services/firebaseConfig';
import type { ConfirmationResult } from '../services/firebaseConfig';
import {
    Phone, Shield, User, ArrowRight, CheckCircle,
    Sparkles, Loader2, Store
} from 'lucide-react';

interface LoginPageProps {
    handleLogin: (userData: UserType) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ handleLogin }) => {
    const [authStep, setAuthStep] = useState<'phone' | 'otp' | 'name'>('phone');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
    const [userName, setUserName] = useState('');
    const [isSeller, setIsSeller] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [countdown, setCountdown] = useState(0);
    const [pendingUserData, setPendingUserData] = useState<any>(null);
    const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
    const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
    const recaptchaVerifierRef = useRef<any>(null);

    // Countdown timer for resend
    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);

    // Setup invisible reCAPTCHA (only when Firebase is configured)
    const setupRecaptcha = () => {
        if (!isFirebaseConfigured() || !auth) return null;
        if (!recaptchaVerifierRef.current) {
            recaptchaVerifierRef.current = new RecaptchaVerifier(auth, 'recaptcha-container', {
                size: 'invisible',
                callback: () => { },
                'expired-callback': () => { recaptchaVerifierRef.current = null; }
            });
        }
        return recaptchaVerifierRef.current;
    };

    const handleSendOTP = async () => {
        if (phoneNumber.length < 10) {
            setError('Please enter a valid 10-digit phone number');
            return;
        }
        setIsLoading(true);
        setError('');
        try {
            if (isFirebaseConfigured() && auth) {
                const recaptchaVerifier = setupRecaptcha();
                const fullPhone = `+91${phoneNumber}`;
                const result = await signInWithPhoneNumber(auth, fullPhone, recaptchaVerifier!);
                setConfirmationResult(result);
            } else {
                const res = await api.requestOTP(phoneNumber, 'register');
                if (!res.success) {
                    setError(res.message || 'Failed to send OTP');
                    setIsLoading(false);
                    return;
                }
            }
            setAuthStep('otp');
            setCountdown(30);
        } catch (e: any) {
            console.error('Send OTP error:', e);
            recaptchaVerifierRef.current = null;
            if (e.code === 'auth/invalid-phone-number') {
                setError('Invalid phone number format');
            } else if (e.code === 'auth/too-many-requests') {
                setError('Too many attempts. Please try again later.');
            } else {
                setError(e.message || 'Failed to send OTP');
            }
        }
        setIsLoading(false);
    };

    const handleOtpChange = (index: number, value: string) => {
        if (value.length > 1) value = value.slice(-1);
        if (value && !/^\d$/.test(value)) return;
        const newDigits = [...otpDigits];
        newDigits[index] = value;
        setOtpDigits(newDigits);
        if (value && index < 5) {
            otpRefs.current[index + 1]?.focus();
        }
    };

    const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
            otpRefs.current[index - 1]?.focus();
        }
    };

    const handleOtpPaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        if (pasted.length > 0) {
            const newDigits = [...otpDigits];
            for (let i = 0; i < 6; i++) {
                newDigits[i] = pasted[i] || '';
            }
            setOtpDigits(newDigits);
            const focusIdx = Math.min(pasted.length, 5);
            otpRefs.current[focusIdx]?.focus();
        }
    };

    const processLoginResponse = (res: any) => {
        if (res.success) {
            if (res.isNewUser && res.user?.name === 'New User') {
                setPendingUserData(res);
                setAuthStep('name');
            } else {
                handleLogin({
                    id: res.user.id,
                    name: res.user.name,
                    email: res.user.email,
                    role: res.user.role,
                    phone: res.user.phone,
                    isVerified: res.user.isVerified,
                });
            }
        } else {
            setError(res.message || 'Verification failed');
        }
    };

    const handleVerifyOTP = async () => {
        const otp = otpDigits.join('');
        if (otp.length !== 6) {
            setError('Please enter the complete 6-digit OTP');
            return;
        }
        setIsLoading(true);
        setError('');
        try {
            const role = isSeller ? 'seller' : 'buyer';

            if (isFirebaseConfigured() && confirmationResult) {
                const firebaseResult = await confirmationResult.confirm(otp);
                const idToken = await firebaseResult.user.getIdToken();
                const res = await api.verifyFirebaseToken(idToken, userName || undefined, role);
                processLoginResponse(res);
            } else {
                const res = await api.verifyOTP(phoneNumber, otp, userName || undefined, role);
                processLoginResponse(res);
            }
        } catch (e: any) {
            console.error('OTP verify error:', e);
            if (e.code === 'auth/invalid-verification-code') {
                setError('Invalid OTP. Please check and try again.');
            } else if (e.code === 'auth/code-expired') {
                setError('OTP expired. Please request a new one.');
            } else {
                setError(e.message || 'Verification failed');
            }
            setOtpDigits(['', '', '', '', '', '']);
            otpRefs.current[0]?.focus();
        }
        setIsLoading(false);
    };

    const handleResendOTP = async () => {
        if (countdown > 0) return;
        setIsLoading(true);
        setError('');
        try {
            if (isFirebaseConfigured() && auth) {
                recaptchaVerifierRef.current = null;
                const recaptchaVerifier = setupRecaptcha();
                const fullPhone = `+91${phoneNumber}`;
                const result = await signInWithPhoneNumber(auth, fullPhone, recaptchaVerifier!);
                setConfirmationResult(result);
            } else {
                await api.resendOTP(phoneNumber, 'register');
            }
            setCountdown(30);
            setOtpDigits(['', '', '', '', '', '']);
            otpRefs.current[0]?.focus();
        } catch (e: any) {
            recaptchaVerifierRef.current = null;
            setError(e.message || 'Failed to resend OTP');
        }
        setIsLoading(false);
    };

    const handleCompleteName = async () => {
        if (!userName.trim()) {
            setError('Please enter your name');
            return;
        }
        setIsLoading(true);
        setError('');
        try {
            await api.updateProfile({ name: userName.trim() });
            handleLogin({
                id: pendingUserData.user.id,
                name: userName.trim(),
                email: pendingUserData.user.email,
                role: pendingUserData.user.role,
                phone: pendingUserData.user.phone,
                isVerified: true,
            });
        } catch (e: any) {
            handleLogin({
                id: pendingUserData.user.id,
                name: userName.trim(),
                email: pendingUserData.user.email,
                role: pendingUserData.user.role,
                phone: pendingUserData.user.phone,
                isVerified: true,
            });
        }
        setIsLoading(false);
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <span className="text-5xl brand-font text-blue-900 tracking-tighter">
                        Local<span className="text-blue-600">Kart</span>
                    </span>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] mt-2">
                        Your Neighborhood, Faster
                    </p>
                </div>

                {/* Card */}
                <div className="bg-white p-8 sm:p-10 rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-blue-900/5 relative overflow-hidden">
                    {/* Decorative gradient */}
                    <div className="absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br from-blue-100 to-blue-50 rounded-full opacity-60" />
                    <div className="absolute -bottom-16 -left-16 w-32 h-32 bg-gradient-to-tr from-blue-50 to-transparent rounded-full opacity-40" />

                    <div className="relative z-10">
                        {/* Step indicators */}
                        <div className="flex items-center justify-center gap-2 mb-8">
                            {['phone', 'otp', 'name'].map((step, i) => (
                                <div key={step} className="flex items-center gap-2">
                                    <div className={`w-2.5 h-2.5 rounded-full transition-all duration-500 ${authStep === step ? 'bg-blue-600 scale-125 shadow-lg shadow-blue-500/30' :
                                        ['phone', 'otp', 'name'].indexOf(authStep) > i ? 'bg-blue-400' : 'bg-slate-200'
                                        }`} />
                                    {i < 2 && <div className={`w-8 h-0.5 transition-all duration-500 ${['phone', 'otp', 'name'].indexOf(authStep) > i ? 'bg-blue-400' : 'bg-slate-200'
                                        }`} />}
                                </div>
                            ))}
                        </div>

                        {/* STEP 1: Phone Number */}
                        {authStep === 'phone' && (
                            <div className="space-y-6">
                                <div className="text-center">
                                    <div className="bg-blue-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                        <Phone className="h-7 w-7 text-blue-600" />
                                    </div>
                                    <h2 className="text-2xl font-black text-slate-900 mb-1">Welcome</h2>
                                    <p className="text-slate-500 text-sm font-medium">Enter your phone number to get started</p>
                                </div>

                                <div className="space-y-4">
                                    <div className="relative">
                                        <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 font-black text-sm">+91</span>
                                        <input
                                            type="tel"
                                            value={phoneNumber}
                                            onChange={(e) => {
                                                const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                                                setPhoneNumber(val);
                                                setError('');
                                            }}
                                            placeholder="Enter phone number"
                                            className="w-full pl-14 pr-5 py-5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-600/10 focus:border-blue-500 outline-none font-extrabold text-lg transition-all placeholder:font-bold placeholder:text-slate-300"
                                            maxLength={10}
                                            autoFocus
                                        />
                                    </div>

                                    {/* Seller Toggle */}
                                    <button
                                        type="button"
                                        onClick={() => setIsSeller(!isSeller)}
                                        className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl border-2 transition-all duration-300 ${isSeller
                                            ? 'border-blue-500 bg-blue-50/50 shadow-lg shadow-blue-500/10'
                                            : 'border-slate-100 bg-slate-50/50 hover:border-slate-200'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <Store className={`h-5 w-5 transition-colors ${isSeller ? 'text-blue-600' : 'text-slate-400'}`} />
                                            <span className={`font-bold text-sm ${isSeller ? 'text-blue-900' : 'text-slate-500'}`}>
                                                I want to sell on LocalKart
                                            </span>
                                        </div>
                                        <div className={`w-11 h-6 rounded-full p-0.5 transition-all duration-300 ${isSeller ? 'bg-blue-600' : 'bg-slate-200'
                                            }`}>
                                            <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-300 ${isSeller ? 'translate-x-5' : 'translate-x-0'
                                                }`} />
                                        </div>
                                    </button>
                                    {isSeller && (
                                        <p className="text-xs text-blue-600 font-bold text-center px-4 -mt-1">
                                            🏪 You'll be registered as a seller and can set up your store after login
                                        </p>
                                    )}
                                </div>

                                <button
                                    onClick={handleSendOTP}
                                    disabled={isLoading || phoneNumber.length < 10}
                                    className="w-full bg-blue-900 text-white py-5 rounded-2xl font-black text-lg hover:bg-blue-950 transition-all shadow-xl shadow-blue-900/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <>
                                        Send OTP <ArrowRight className="h-5 w-5" />
                                    </>}
                                </button>
                            </div>
                        )}

                        {/* STEP 2: OTP Verification */}
                        {authStep === 'otp' && (
                            <div className="space-y-6">
                                <div className="text-center">
                                    <div className="bg-green-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                        <Shield className="h-7 w-7 text-green-600" />
                                    </div>
                                    <h2 className="text-2xl font-black text-slate-900 mb-1">Verify OTP</h2>
                                    <p className="text-slate-500 text-sm font-medium">
                                        Code sent to <span className="text-slate-900 font-bold">+91 {phoneNumber}</span>
                                    </p>
                                    <button
                                        onClick={() => { setAuthStep('phone'); setOtpDigits(['', '', '', '', '', '']); setError(''); }}
                                        className="text-blue-600 text-xs font-bold mt-1 hover:underline"
                                    >
                                        Change number
                                    </button>
                                </div>

                                {/* OTP Input Boxes */}
                                <div className="flex justify-center gap-2 sm:gap-3" onPaste={handleOtpPaste}>
                                    {otpDigits.map((digit, i) => (
                                        <input
                                            key={i}
                                            ref={(el) => { otpRefs.current[i] = el; }}
                                            type="text"
                                            inputMode="numeric"
                                            maxLength={1}
                                            value={digit}
                                            onChange={(e) => handleOtpChange(i, e.target.value)}
                                            onKeyDown={(e) => handleOtpKeyDown(i, e)}
                                            className={`w-12 h-14 sm:w-14 sm:h-16 text-center text-xl font-black rounded-xl border-2 outline-none transition-all duration-200 ${digit
                                                ? 'border-blue-500 bg-blue-50/50 text-blue-900 shadow-lg shadow-blue-500/10'
                                                : 'border-slate-200 bg-slate-50 text-slate-900 focus:border-blue-500 focus:bg-white focus:shadow-lg focus:shadow-blue-500/10'
                                                }`}
                                            autoFocus={i === 0}
                                        />
                                    ))}
                                </div>

                                <button
                                    onClick={handleVerifyOTP}
                                    disabled={isLoading || otpDigits.join('').length !== 6}
                                    className="w-full bg-blue-900 text-white py-5 rounded-2xl font-black text-lg hover:bg-blue-950 transition-all shadow-xl shadow-blue-900/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <>
                                        Verify & Continue <CheckCircle className="h-5 w-5" />
                                    </>}
                                </button>

                                {/* Resend */}
                                <div className="text-center">
                                    {countdown > 0 ? (
                                        <p className="text-slate-400 text-sm font-bold">
                                            Resend OTP in <span className="text-blue-600 font-black">{countdown}s</span>
                                        </p>
                                    ) : (
                                        <button
                                            onClick={handleResendOTP}
                                            disabled={isLoading}
                                            className="text-blue-600 text-sm font-bold hover:underline disabled:opacity-50"
                                        >
                                            Resend OTP
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* STEP 3: Name Entry (new users) */}
                        {authStep === 'name' && (
                            <div className="space-y-6">
                                <div className="text-center">
                                    <div className="bg-purple-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                        <User className="h-7 w-7 text-purple-600" />
                                    </div>
                                    <h2 className="text-2xl font-black text-slate-900 mb-1">Almost there!</h2>
                                    <p className="text-slate-500 text-sm font-medium">What should we call you?</p>
                                </div>

                                <input
                                    type="text"
                                    value={userName}
                                    onChange={(e) => { setUserName(e.target.value); setError(''); }}
                                    placeholder="Enter your full name"
                                    className="w-full px-5 py-5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-600/10 focus:border-blue-500 outline-none font-extrabold text-lg transition-all placeholder:font-bold placeholder:text-slate-300"
                                    autoFocus
                                    onKeyDown={(e) => e.key === 'Enter' && handleCompleteName()}
                                />

                                <button
                                    onClick={handleCompleteName}
                                    disabled={isLoading || !userName.trim()}
                                    className="w-full bg-blue-900 text-white py-5 rounded-2xl font-black text-lg hover:bg-blue-950 transition-all shadow-xl shadow-blue-900/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <>
                                        Start Shopping <Sparkles className="h-5 w-5" />
                                    </>}
                                </button>
                            </div>
                        )}

                        {/* Error message */}
                        {error && (
                            <div className="mt-4 bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm font-bold text-center">
                                {error}
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer hint */}
                <p className="text-center text-slate-400 text-xs font-medium mt-6">
                    By continuing, you agree to our Terms & Privacy Policy
                </p>
            </div>
        </div>
    );
};

export default LoginPage;
