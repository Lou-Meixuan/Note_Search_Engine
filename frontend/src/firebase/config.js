/**
 * config.js - Firebase configuration
 * 
 * Initialize Firebase app with Google Authentication.
 * Configure your own Firebase project at https://console.firebase.google.com/
 */

import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyCZ1F4Cr9difHqIs20x-PEJp_0KNcBLw-g",
    authDomain: "note-search-engine-mlc.firebaseapp.com",
    projectId: "note-search-engine-mlc",
    storageBucket: "note-search-engine-mlc.firebasestorage.app",
    messagingSenderId: "363828046798",
    appId: "1:363828046798:web:5c1bcb4467e3b23e37199f"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export default app;
