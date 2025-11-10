import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { firebaseConfig, localAppId } from '../firebaseConfig.js';

let app, db, auth, storage;

export const initializeFirebase = () => {
  if (!app) {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
    
    // 🚨 TEMPORARY: Bypass Play Integrity validation for testing
    // This disables app verification to solve auth/invalid-app-credential errors
    // TODO: Remove this line after SHA-1 fingerprint issues are resolved
    auth.settings.appVerificationDisabledForTesting = true;
    console.log('[Firebase] ⚠️ App verification disabled for testing');
    
    storage = getStorage(app);
  }
  return { app, db, auth, storage };
};

export const getFirebaseInstances = () => {
  if (!app) {
    initializeFirebase();
  }
  return { app, db, auth, storage };
};

export const appId = localAppId;
