
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyBIWhOF5rtZCBv-P1A56drb5aomW3y8Pjs",
  authDomain: "ctrotech-tutor-insights.firebaseapp.com",
  databaseURL: "https://ctrotech-tutor-insights-default-rtdb.firebaseio.com",
  projectId: "ctrotech-tutor-insights",
  storageBucket: "ctrotech-tutor-insights.firebasestorage.app",
  messagingSenderId: "448152774845",
  appId: "1:448152774845:web:143b6b6f0c370261c86fd4",
  measurementId: "G-4SWH79LSWS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const database = getDatabase(app);

export default app;
