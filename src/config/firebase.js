import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase project configuration
// From Firebase Console -> Project Settings -> General -> Your apps
const firebaseApiKey = import.meta.env.VITE_FIREBASE_API_KEY;

if (!firebaseApiKey) {
  throw new Error('Missing VITE_FIREBASE_API_KEY environment variable');
}

const firebaseConfig = {
  apiKey: firebaseApiKey,
  authDomain: "managevehicle-8245e-10753.firebaseapp.com",
  projectId: "managevehicle-8245e-10753",
  storageBucket: "managevehicle-8245e-10753.firebasestorage.app",
  messagingSenderId: "160017116560",
  appId: "1:160017116560:web:9fe0e896f3a5d396f8d715"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;


