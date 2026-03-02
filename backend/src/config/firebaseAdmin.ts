// Firebase Admin SDK Initialization
// Used to verify Firebase ID tokens on the backend

import admin from 'firebase-admin';
import path from 'path';
import fs from 'fs';

let firebaseAdmin: admin.app.App;

const initializeFirebaseAdmin = (): admin.app.App => {
    if (firebaseAdmin) return firebaseAdmin;

    try {
        // Option 1: Service account JSON file path from env
        const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;

        if (serviceAccountPath) {
            const fullPath = path.resolve(serviceAccountPath);
            if (fs.existsSync(fullPath)) {
                const serviceAccount = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
                firebaseAdmin = admin.initializeApp({
                    credential: admin.credential.cert(serviceAccount)
                });
                console.log('Firebase Admin initialized with service account file');
                return firebaseAdmin;
            }
        }

        // Option 2: Service account JSON from env variable directly
        const serviceAccountJSON = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
        if (serviceAccountJSON) {
            const serviceAccount = JSON.parse(serviceAccountJSON);
            firebaseAdmin = admin.initializeApp({
                credential: admin.credential.cert(serviceAccount)
            });
            console.log('Firebase Admin initialized with service account JSON');
            return firebaseAdmin;
        }

        // Option 3: Individual env variables
        if (process.env.FIREBASE_PROJECT_ID) {
            firebaseAdmin = admin.initializeApp({
                credential: admin.credential.cert({
                    projectId: process.env.FIREBASE_PROJECT_ID,
                    clientEmail: process.env.FIREBASE_CLIENT_EMAIL || '',
                    privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
                }),
            });
            console.log('Firebase Admin initialized with env variables');
            return firebaseAdmin;
        }

        // Fallback: Default credentials (for GCP-hosted environments)
        firebaseAdmin = admin.initializeApp();
        console.log('Firebase Admin initialized with default credentials');
        return firebaseAdmin;
    } catch (error) {
        console.error('Failed to initialize Firebase Admin:', error);
        throw error;
    }
};

export const getFirebaseAdmin = (): admin.app.App => {
    if (!firebaseAdmin) {
        return initializeFirebaseAdmin();
    }
    return firebaseAdmin;
};

export const verifyFirebaseIdToken = async (idToken: string) => {
    const app = getFirebaseAdmin();
    return admin.auth(app).verifyIdToken(idToken);
};

export default { getFirebaseAdmin, verifyFirebaseIdToken };
