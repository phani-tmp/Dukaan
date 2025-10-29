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
