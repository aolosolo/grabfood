// src/lib/firebase.ts
import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// IMPORTANT: Your Firebase project configuration is read from the .env file.
const firebaseConfig = {
  apiKey: "AIzaSyCqu9nj7UdiFP2a39TjE0mEBBjW8LLKoiA",
  authDomain: "fastgrab.firebaseapp.com",
  projectId: "fastgrab",
  storageBucket: "fastgrab.firebasestorage.app",
  messagingSenderId: "835565121090",
  appId: "1:835565121090:web:23f55570c915761b7687db"
};

// Initialize Firebase using a singleton pattern to avoid re-initialization in Next.js
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const db = getFirestore(app);

export { app, db };
