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
    const isDev = typeof __DEV__ !== 'undefined' && __DEV__;
    const hostname = window.location.hostname;
    const isLocalhost = 
      hostname === 'localhost' || 
      hostname === '127.0.0.1' || 
      hostname.startsWith('192.168.') || 
      hostname.startsWith('10.') || 
      hostname.endsWith('.local');
    
    if (!isDev && !isLocalhost) {
      isSupported().then(supported => {
        if (supported) {
          firebaseAnalytics = getAnalytics(firebaseApp);
        }
      }).catch(() => {
        // Gracefully bypass unsupported browser error
      });
    }
  }
}
