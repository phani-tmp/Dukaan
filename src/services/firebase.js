import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { firebaseConfig, localAppId } from '../firebaseConfig.js';

let app, db, auth;

export const initializeFirebase = () => {
  if (!app) {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
  }
  return { app, db, auth };
};

export const getFirebaseInstances = () => {
  if (!app) {
    initializeFirebase();
  }
  return { app, db, auth };
};

export const appId = localAppId;
