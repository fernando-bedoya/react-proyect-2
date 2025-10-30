// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAdEAb3urB1jwxUlyDzWcEh10EOPhifdhw",
  authDomain: "react-proyect-fernando.firebaseapp.com",
  projectId: "react-proyect-fernando",
  storageBucket: "react-proyect-fernando.firebasestorage.app",
  messagingSenderId: "387736521137",
  appId: "1:387736521137:web:dd507ed1fc9a14678e1590",
  measurementId: "G-VBLNFRH7M4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Analytics (solo en producción)
let analytics;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

export { analytics };
export default app;