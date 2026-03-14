import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyA90WhvJTWFkntUzsN3ODvOzTCTuFiIB-Y",
  authDomain: "lodgeease-g.firebaseapp.com",
  projectId: "lodgeease-g",
  storageBucket: "lodgeease-g.firebasestorage.app",
  messagingSenderId: "959530546183",
  appId: "1:959530546183:web:61cd15b0a1aaee49fb66a2",
  measurementId: "G-DMVX8XP9Q1"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

// Analytics is optional and only works in supported browser environments
export const analyticsPromise = isSupported().then(yes => yes ? getAnalytics(app) : null);
