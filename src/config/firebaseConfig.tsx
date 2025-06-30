// @/config/firebaseConfig.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyD2YieupthdsqBItdMd0lFkYKlVxdzKT8I",
  authDomain: "care4you1-62cc7.firebaseapp.com",
  projectId: "care4you1-62cc7",
  storageBucket: "care4you1-62cc7.appspot.com",
  messagingSenderId: "617055937715",
  appId: "1:617055937715:android:4b08984ae563213174bcc6"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;