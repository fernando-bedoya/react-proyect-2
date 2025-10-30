// Firebase configuration
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

// Tu configuración de Firebase
// IMPORTANTE: Reemplaza estos valores con los de tu proyecto Firebase
// Los puedes obtener en: Firebase Console > Project Settings > Your apps > Web app
const firebaseConfig = {
  apiKey: "AIzaSyAdEAb3urB1jwxUlyDzWcEh10EOPhifdhw",
  authDomain: "react-proyect-fernando.firebaseapp.com",
  projectId: "react-proyect-fernando",
  storageBucket: "react-proyect-fernando.firebasestorage.app",
  messagingSenderId: "387736521137",
  appId: "1:387736521137:web:dd507ed1fc9a14678e1590",
  measurementId: "G-VBLNFRH7M4"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar servicios de Firebase
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Analytics (solo en producción)
let analytics;
if (typeof window !== 'undefined' && import.meta.env.PROD) {
  analytics = getAnalytics(app);
}

export { analytics };
export default app;
