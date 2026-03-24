// Firebase Client SDK (browser-side and server routes)
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCRHabzHd27M8Qu_h49s540t3sSCVgffI8",
  authDomain: "vibemessanger-4d34e.firebaseapp.com",
  projectId: "vibemessanger-4d34e",
  storageBucket: "vibemessanger-4d34e.firebasestorage.app",
  messagingSenderId: "224771601286",
  appId: "1:224771601286:web:363b9663a6ab048bcdf207",
  measurementId: "G-VCPZSQPCR2"
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export default app;
