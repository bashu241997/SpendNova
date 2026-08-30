import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAnalytics, isSupported } from 'firebase/analytics';
import { Platform } from 'react-native';

const apiKey = process.env.EXPO_PUBLIC_FIREBASE_API_KEY;
const authDomain = process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN;
const projectId = process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID;
const storageBucket = process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET;
const messagingSenderId = process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID;
const appId = process.env.EXPO_PUBLIC_FIREBASE_APP_ID;
const measurementId = process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID;

const isConfigured = Boolean(apiKey && projectId && appId);

export let firebaseApp: any = null;
export let firebaseAnalytics: any = null;

if (isConfigured) {
  const firebaseConfig = {
    apiKey,
    authDomain,
    projectId,
    storageBucket,
    messagingSenderId,
    appId,
    measurementId,
  };

  firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    // Prevent Google Analytics from tracking on localhost
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    
    if (!isLocalhost) {
      isSupported().then(supported => {
        if (supported) {
          firebaseAnalytics = getAnalytics(firebaseApp);
        }
      }).catch(() => {
        // Bypasses analytics unsupported browser error gracefully
      });
    }
  }
}
