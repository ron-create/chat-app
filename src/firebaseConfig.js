// src/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCE39ASA-rakvl-y9f6k33LOl500p1Frb4",
  authDomain: "chatapp-87f24.firebaseapp.com",
  projectId: "chatapp-87f24",
  storageBucket: "chatapp-87f24.firebasestorage.app",
  messagingSenderId: "280322346331",
  appId: "1:280322346331:web:b8b0fef82fe8cf13ed9e7e",
  measurementId: "G-N0F04RY3E7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
