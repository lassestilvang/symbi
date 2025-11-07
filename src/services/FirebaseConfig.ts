/**
 * Firebase Configuration
 * 
 * This file contains Firebase initialization and configuration.
 * Requirements: 9.5, 11.2, 11.3
 * 
 * Note: In production, these values should be stored in environment variables
 * and loaded via a secure configuration system.
 */

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

// Default configuration (should be replaced with actual Firebase project credentials)
export const firebaseConfig: FirebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || 'YOUR_API_KEY',
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || 'symbi-app.firebaseapp.com',
  projectId: process.env.FIREBASE_PROJECT_ID || 'symbi-app',
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'symbi-app.appspot.com',
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || '123456789',
  appId: process.env.FIREBASE_APP_ID || '1:123456789:web:abcdef',
};

/**
 * Check if Firebase is properly configured
 */
export const isFirebaseConfigured = (): boolean => {
  return (
    firebaseConfig.apiKey !== 'YOUR_API_KEY' &&
    firebaseConfig.projectId !== 'symbi-app'
  );
};
