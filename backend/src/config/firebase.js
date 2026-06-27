import admin from 'firebase-admin';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to your Firebase service account key
const serviceAccountPath = path.resolve(__dirname, './kimayaayurveda-51482-firebase-adminsdk-fbsvc-8e63d99abc.json');

let isFirebaseInitialized = false;

if (fs.existsSync(serviceAccountPath)) {
    try {
        const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
        
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        isFirebaseInitialized = true;
        console.log('Firebase Admin initialized successfully');
    } catch (error) {
        console.error('Failed to initialize Firebase Admin:', error);
    }
} else {
    console.warn(`Firebase service account file not found at ${serviceAccountPath}. Push notifications will not work.`);
}

export { admin, isFirebaseInitialized };
