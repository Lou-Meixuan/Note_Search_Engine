/**
 * AuthContext.jsx - Authentication context
 * 
 * Manages user authentication state using Firebase.
 * Provides Google Sign-In and Sign-Out functionality.
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
    signInWithPopup, 
    signOut, 
    onAuthStateChanged 
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase/config';

const AuthContext = createContext(null);

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    async function signInWithGoogle() {
        try {
            setError(null);
            const result = await signInWithPopup(auth, googleProvider);
            return result.user;
        } catch (err) {
            console.error('Google Sign In Error:', err);
            setError(err.message);
            throw err;
        }
    }

    async function logout() {
        try {
            setError(null);
            await signOut(auth);
        } catch (err) {
            console.error('Sign Out Error:', err);
            setError(err.message);
            throw err;
        }
    }

    const value = {
        user,
        loading,
        error,
        signInWithGoogle,
        logout,
        isLoggedIn: !!user,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export default AuthContext;
