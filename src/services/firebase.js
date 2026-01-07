import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { firebaseConfig, localAppId } from '../firebaseConfig.js';

import { getFunctions } from 'firebase/functions';

let app, db, auth, storage, functions;

export const initializeFirebase = () => {
  if (!app) {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
    functions = getFunctions(app);

    // Play Integrity / reCAPTCHA will now be used for verification
    // Ensure SHA-1 and SHA-256 fingerprints are added to Firebase Console for Android

    // Enable App Check with Debug Token for Emulator
    if (import.meta.env.DEV) {
      self.FIREBASE_APPCHECK_DEBUG_TOKEN = "5A3EA684-7719-43A2-9E34-DB8B036DA686";
    }

    storage = getStorage(app);
  }
  return { app, db, auth, storage, functions };
};

export const getFirebaseInstances = () => {
  if (!app) {
    initializeFirebase();
  }
  return { app, db, auth, storage, functions };
};

export const appId = localAppId;
