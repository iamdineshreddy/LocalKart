import React, { useState, useEffect, useRef, useMemo } from 'react';
import { User as UserType } from '../types';
import api from '../services/api';
import { auth, RecaptchaVerifier, signInWithPhoneNumber, isFirebaseConfigured } from '../services/firebaseConfig';
import type { ConfirmationResult } from '../services/firebaseConfig';
import {
    Phone, Shield, User, ArrowRight, CheckCircle,
    Sparkles, Loader2, Store, Mail, Lock, Eye, EyeOff, UserPlus, LogIn, Home
} from 'lucide-react';
import Particles, { initParticlesEngine } from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';

interface LoginPageProps {
    handleLogin: (userData: UserType) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ handleLogin }) => {
    // Auth mode: 'phone' for OTP flow, 'email' for email/password
    const [authMode, setAuthMode] = useState<'phone' | 'email'>('email');

    // Phone/OTP state
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

    // Email state
    const [emailTab, setEmailTab] = useState<'login' | 'signup'>('login');
    const [emailInput, setEmailInput] = useState('');
    const [passwordInput, setPasswordInput] = useState('');
    const [nameInput, setNameInput] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [emailIsSeller, setEmailIsSeller] = useState(false);

    // --- tsparticles Setup ---
    const [particlesReady, setParticlesReady] = useState(false);

    useEffect(() => {
        initParticlesEngine(async (engine) => {
            await loadSlim(engine);
        }).then(() => {
            setParticlesReady(true);
        });
    }, []);

    const particlesOptions = useMemo(() => ({
        background: { color: { value: "#0a0c10" } }, // Dark gradient-like initial color
        fpsLimit: 120,
        interactivity: {
            events: {
                onClick: { enable: true, mode: "push" },
                onHover: { enable: true, mode: "repulse" },
                resize: { enable: true }
            },
            modes: {
                push: { quantity: 4 },
                repulse: { distance: 150, duration: 0.4 }
            }
        },
        particles: {
            color: {
                value: ["#ff0055", "#00ffcc", "#00aaff", "#aa00ff", "#ffcc00"] // RGB glowing tones
            },
            links: {
                color: "#ffffff",
                distance: 150,
                enable: true,
                opacity: 0.15,
                width: 1
            },
            move: {
                direction: "none" as const,
                enable: true,
                outModes: { default: "bounce" as const },
                random: true,
                speed: 1.5,
                straight: false
            },
            number: {
                density: { enable: true, area: 800 },
                value: 80
            },
            opacity: { value: 0.7 },
            shape: { type: "circle" },
            size: {
                value: { min: 2, max: 6 }
            }
        },
        detectRetina: true
    }), []);

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

    // Email login handler
    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!emailInput || !passwordInput) {
            setError('Email and password are required');
            return;
        }
        setIsLoading(true);
        setError('');
        try {
            // Route admin credentials to the admin login endpoint
            const isAdminEmail = emailInput.toLowerCase() === 'admin@localkart.com' || emailInput.toLowerCase() === 'admin@test.com';
            const res = isAdminEmail
                ? await api.adminLogin(emailInput, passwordInput)
                : await api.emailLogin(emailInput, passwordInput);
            if (res.success) {
                handleLogin({
                    id: res.user.id || res.user._id,
                    name: res.user.name,
                    email: res.user.email,
                    role: res.user.role,
                    phone: res.user.phone,
                    isVerified: res.user.isVerified,
                });
            }
        } catch (e: any) {
            setError(e.message || 'Login failed');
        }
        setIsLoading(false);
    };

    // Email signup handler
    const handleEmailSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!nameInput || !emailInput || !passwordInput) {
            setError('All fields are required');
            return;
        }
        if (passwordInput.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }
        setIsLoading(true);
        setError('');
        try {
            const res = await api.emailSignup({
                name: nameInput,
                email: emailInput,
                password: passwordInput,
                role: emailIsSeller ? 'seller' : 'buyer',
            });
            if (res.success) {
                handleLogin({
                    id: res.user.id || res.user._id,
                    name: res.user.name,
                    email: res.user.email,
                    role: res.user.role,
                    phone: res.user.phone,
                    isVerified: res.user.isVerified,
                });
            }
        } catch (e: any) {
            setError(e.message || 'Signup failed');
        }
        setIsLoading(false);
    };

    // Prefill test credentials
    const fillTestLogin = (email: string) => {
        setEmailInput(email);
        setPasswordInput(email.includes('admin') ? 'admin123' : '123456');
        setError('');
    };

    return (
        <div style={{
            position: 'relative',
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            fontFamily: "'Inter', sans-serif",
            overflow: 'hidden',
            backgroundColor: '#0a0c10' // Base dark color
        }}>
            {/* Animated Particles Background */}
            {particlesReady && (
                <Particles
                    id="tsparticles"
                    options={particlesOptions}
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        zIndex: 0
                    }}
                />
            )}

            {/* Dark overlay for extra depth */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.6) 100%)',
                zIndex: 1,
                pointerEvents: 'none'
            }} />

            {/* Back to Home Button */}
            <button
                onClick={() => window.location.href = '/'}
                style={{
                    position: 'absolute', top: 24, left: 24, zIndex: 10,
                    display: 'flex', alignItems: 'center', gap: 8,
                    background: 'rgba(255,255,255,0.1)', color: 'white',
                    border: '1px solid rgba(255,255,255,0.2)', padding: '10px 16px', borderRadius: 24,
                    fontSize: 14, fontWeight: 500, cursor: 'pointer', backdropFilter: 'blur(10px)'
                }}
            >
                <Home size={18} /> Back to Home
            </button>

            <div style={{ width: '100%', maxWidth: 460, zIndex: 10, position: 'relative' }}>
                {/* Logo */}
                <div className="text-center mb-8">
                    <span className="text-5xl brand-font text-white tracking-tighter drop-shadow-lg">
                        Local<span className="text-blue-400">Kart</span>
                    </span>
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.25em] mt-2">
                        Your Neighborhood, Faster
                    </p>
                </div>

                {/* Auth Mode Toggle */}
                <div className="flex gap-2 mb-6 bg-white/10 backdrop-blur-md p-1.5 rounded-2xl border border-white/20">
                    <button
                        onClick={() => { setAuthMode('email'); setError(''); }}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-extrabold transition-all ${authMode === 'email' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-300 hover:text-white'
                            }`}
                    >
                        <Mail className="h-4 w-4" /> Email
                    </button>
                    <button
                        onClick={() => { setAuthMode('phone'); setError(''); }}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-extrabold transition-all ${authMode === 'phone' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-300 hover:text-white'
                            }`}
                    >
                        <Phone className="h-4 w-4" /> Phone OTP
                    </button>
                </div>

                {/* Card */}
                <div className="bg-white/95 backdrop-blur-xl p-8 sm:p-10 rounded-[2.5rem] border border-white/20 shadow-2xl relative overflow-hidden">
                    {/* Decorative gradient */}
                    <div className="absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br from-blue-100 to-blue-50 rounded-full opacity-60" />
                    <div className="absolute -bottom-16 -left-16 w-32 h-32 bg-gradient-to-tr from-blue-50 to-transparent rounded-full opacity-40" />

                    <div className="relative z-10">

                        {/* ===== EMAIL AUTH MODE ===== */}
                        {authMode === 'email' && (
                            <>
                                {/* Login / Signup tab */}
                                <div className="flex gap-1 mb-6 bg-slate-50 p-1 rounded-xl">
                                    <button
                                        onClick={() => { setEmailTab('login'); setError(''); }}
                                        className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${emailTab === 'login' ? 'bg-blue-600 text-white shadow' : 'text-slate-500 hover:text-slate-700'
                                            }`}
                                    >
                                        <LogIn className="h-3.5 w-3.5" /> Login
                                    </button>
                                    <button
                                        onClick={() => { setEmailTab('signup'); setError(''); }}
                                        className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${emailTab === 'signup' ? 'bg-blue-600 text-white shadow' : 'text-slate-500 hover:text-slate-700'
                                            }`}
                                    >
                                        <UserPlus className="h-3.5 w-3.5" /> Sign Up
                                    </button>
                                </div>

                                {emailTab === 'login' ? (
                                    <form onSubmit={handleEmailLogin} className="space-y-5">
                                        <div className="text-center mb-4">
                                            <div className="bg-blue-50 w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3">
                                                <LogIn className="h-6 w-6 text-blue-600" />
                                            </div>
                                            <h2 className="text-2xl font-black text-slate-900">Welcome Back</h2>
                                            <p className="text-slate-500 text-sm font-medium mt-1">Login with your email</p>
                                        </div>

                                        <div>
                                            <div className="relative">
                                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                                <input
                                                    type="email"
                                                    value={emailInput}
                                                    onChange={(e) => { setEmailInput(e.target.value); setError(''); }}
                                                    placeholder="Email address"
                                                    className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-600/10 focus:border-blue-500 outline-none font-bold text-sm transition-all"
                                                    autoFocus
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <div className="relative">
                                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                                <input
                                                    type={showPassword ? 'text' : 'password'}
                                                    value={passwordInput}
                                                    onChange={(e) => { setPasswordInput(e.target.value); setError(''); }}
                                                    placeholder="Password"
                                                    className="w-full pl-11 pr-12 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-600/10 focus:border-blue-500 outline-none font-bold text-sm transition-all"
                                                />
                                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                </button>
                                            </div>
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={isLoading}
                                            className="w-full bg-blue-900 text-white py-4 rounded-2xl font-black text-lg hover:bg-blue-950 transition-all shadow-xl shadow-blue-900/20 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                                        >
                                            {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Login <ArrowRight className="h-5 w-5" /></>}
                                        </button>

                                        {/* Test credentials */}
                                        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Quick Test Login</p>
                                            <div className="flex gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => fillTestLogin('buyer@test.com')}
                                                    className="flex-1 bg-blue-50 text-blue-700 py-2.5 rounded-xl text-xs font-black hover:bg-blue-100 transition-all"
                                                >
                                                    🛒 Buyer
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => fillTestLogin('seller@test.com')}
                                                    className="flex-1 bg-purple-50 text-purple-700 py-2.5 rounded-xl text-xs font-black hover:bg-purple-100 transition-all"
                                                >
                                                    🏪 Seller
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => fillTestLogin('admin@test.com')}
                                                    className="flex-1 bg-amber-50 text-amber-700 py-2.5 rounded-xl text-xs font-black hover:bg-amber-100 transition-all"
                                                >
                                                    🛡️ Admin
                                                </button>
                                            </div>
                                            <p className="text-[9px] text-slate-400 font-medium mt-2 text-center">
                                                Passwords: <span className="font-bold text-slate-600">123456</span> (Users) | <span className="font-bold text-slate-600">admin123</span> (Admin)
                                            </p>
                                        </div>
                                    </form>
                                ) : (
                                    <form onSubmit={handleEmailSignup} className="space-y-5">
                                        <div className="text-center mb-4">
                                            <div className="bg-green-50 w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3">
                                                <UserPlus className="h-6 w-6 text-green-600" />
                                            </div>
                                            <h2 className="text-2xl font-black text-slate-900">Create Account</h2>
                                            <p className="text-slate-500 text-sm font-medium mt-1">Sign up with your email</p>
                                        </div>

                                        <div>
                                            <div className="relative">
                                                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                                <input
                                                    type="text"
                                                    value={nameInput}
                                                    onChange={(e) => { setNameInput(e.target.value); setError(''); }}
                                                    placeholder="Full name"
                                                    className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-600/10 focus:border-blue-500 outline-none font-bold text-sm transition-all"
                                                    autoFocus
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <div className="relative">
                                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                                <input
                                                    type="email"
                                                    value={emailInput}
                                                    onChange={(e) => { setEmailInput(e.target.value); setError(''); }}
                                                    placeholder="Email address"
                                                    className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-600/10 focus:border-blue-500 outline-none font-bold text-sm transition-all"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <div className="relative">
                                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                                <input
                                                    type={showPassword ? 'text' : 'password'}
                                                    value={passwordInput}
                                                    onChange={(e) => { setPasswordInput(e.target.value); setError(''); }}
                                                    placeholder="Password (min 6 chars)"
                                                    className="w-full pl-11 pr-12 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-600/10 focus:border-blue-500 outline-none font-bold text-sm transition-all"
                                                />
                                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                </button>
                                            </div>
                                        </div>

                                        {/* Seller Toggle */}
                                        <button
                                            type="button"
                                            onClick={() => setEmailIsSeller(!emailIsSeller)}
                                            className={`w-full flex items-center justify-between px-5 py-3.5 rounded-2xl border-2 transition-all duration-300 ${emailIsSeller
                                                ? 'border-blue-500 bg-blue-50/50 shadow-lg shadow-blue-500/10'
                                                : 'border-slate-100 bg-slate-50/50 hover:border-slate-200'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <Store className={`h-5 w-5 transition-colors ${emailIsSeller ? 'text-blue-600' : 'text-slate-400'}`} />
                                                <span className={`font-bold text-sm ${emailIsSeller ? 'text-blue-900' : 'text-slate-500'}`}>
                                                    Register as Seller
                                                </span>
                                            </div>
                                            <div className={`w-11 h-6 rounded-full p-0.5 transition-all duration-300 ${emailIsSeller ? 'bg-blue-600' : 'bg-slate-200'}`}>
                                                <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-300 ${emailIsSeller ? 'translate-x-5' : 'translate-x-0'}`} />
                                            </div>
                                        </button>

                                        <button
                                            type="submit"
                                            disabled={isLoading}
                                            className="w-full bg-blue-900 text-white py-4 rounded-2xl font-black text-lg hover:bg-blue-950 transition-all shadow-xl shadow-blue-900/20 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                                        >
                                            {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Create Account <Sparkles className="h-5 w-5" /></>}
                                        </button>
                                    </form>
                                )}
                            </>
                        )}

                        {/* ===== PHONE OTP MODE ===== */}
                        {authMode === 'phone' && (
                            <>
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
                                            <h2 className="text-2xl font-black text-slate-900 mb-1">Phone Login</h2>
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
                            </>
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
