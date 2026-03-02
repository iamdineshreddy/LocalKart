// Firebase Configuration for LocalKart
// To enable real SMS, upgrade to Firebase Blaze plan and set real values below.
// Until then, the app uses the dev OTP system (OTP logged to backend console).

import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber, Auth } from 'firebase/auth';
import type { ConfirmationResult } from 'firebase/auth';

// Set to your real Firebase config when ready for production SMS
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Saved Firebase credentials (uncomment when Blaze plan is activated):
// apiKey: "AIzaSyAANQxmoRmICMhuuPc7tQqYre3J1inhVgw",
// authDomain: "local-kart-d5339.firebaseapp.com",
// projectId: "local-kart-d5339",
// storageBucket: "local-kart-d5339.firebasestorage.app",
// messagingSenderId: "31274996567",
// appId: "1:31274996567:web:914ef6f95abb0fbfaaa412",

// Check if Firebase is configured (not placeholder values)
const isFirebaseConfigured = (): boolean => {
    return firebaseConfig.apiKey !== "YOUR_API_KEY" &&
        firebaseConfig.projectId !== "YOUR_PROJECT_ID";
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;

try {
    if (isFirebaseConfigured()) {
        app = initializeApp(firebaseConfig);
        auth = getAuth(app);
        auth.languageCode = 'en';
        console.log('Firebase initialized successfully');
    } else {
        console.warn(
            '⚠️ Firebase SMS disabled. Using dev OTP system (check backend console for OTP codes).'
        );
    }
} catch (error) {
    console.error('Firebase initialization failed:', error);
}

export { app, auth, RecaptchaVerifier, signInWithPhoneNumber, isFirebaseConfigured };
export type { ConfirmationResult };
export default app;
