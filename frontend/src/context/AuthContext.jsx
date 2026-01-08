/**
 * AuthContext.jsx - Authentication context
 * 
 * Manages user authentication state using Firebase.
 * Supports: Google, GitHub, Email/Password, and Anonymous sign-in.
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
    signInWithPopup, 
    signOut, 
    onAuthStateChanged,
    signInAnonymously,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    sendPasswordResetEmail,
    linkWithPopup,
    updateProfile
} from 'firebase/auth';
import { auth, googleProvider, githubProvider } from '../firebase/config';

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

    // Google Sign-In
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

    // GitHub Sign-In
    async function signInWithGithub() {
        try {
            setError(null);
            const result = await signInWithPopup(auth, githubProvider);
            return result.user;
        } catch (err) {
            console.error('GitHub Sign In Error:', err);
            setError(err.message);
            throw err;
        }
    }

    // Email/Password Sign-Up
    async function signUpWithEmail(email, password, displayName) {
        try {
            setError(null);
            const result = await createUserWithEmailAndPassword(auth, email, password);
            // Set display name if provided
            if (displayName) {
                await updateProfile(result.user, { displayName });
            }
            return result.user;
        } catch (err) {
            console.error('Email Sign Up Error:', err);
            setError(err.message);
            throw err;
        }
    }

    // Email/Password Sign-In
    async function signInWithEmail(email, password) {
        try {
            setError(null);
            const result = await signInWithEmailAndPassword(auth, email, password);
            return result.user;
        } catch (err) {
            console.error('Email Sign In Error:', err);
            setError(err.message);
            throw err;
        }
    }

    // Password Reset
    async function resetPassword(email) {
        try {
            setError(null);
            await sendPasswordResetEmail(auth, email);
        } catch (err) {
            console.error('Password Reset Error:', err);
            setError(err.message);
            throw err;
        }
    }

    // Anonymous Sign-In
    async function signInAnonymousUser() {
        try {
            setError(null);
            const result = await signInAnonymously(auth);
            return result.user;
        } catch (err) {
            console.error('Anonymous Sign In Error:', err);
            setError(err.message);
            throw err;
        }
    }

    // Link anonymous account to Google/GitHub
    async function linkToGoogle() {
        try {
            setError(null);
            if (!user?.isAnonymous) throw new Error('User is not anonymous');
            const result = await linkWithPopup(user, googleProvider);
            return result.user;
        } catch (err) {
            console.error('Link to Google Error:', err);
            setError(err.message);
            throw err;
        }
    }

    async function linkToGithub() {
        try {
            setError(null);
            if (!user?.isAnonymous) throw new Error('User is not anonymous');
            const result = await linkWithPopup(user, githubProvider);
            return result.user;
        } catch (err) {
            console.error('Link to GitHub Error:', err);
            setError(err.message);
            throw err;
        }
    }

    // Logout
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
        // Sign-in methods
        signInWithGoogle,
        signInWithGithub,
        signUpWithEmail,
        signInWithEmail,
        signInAnonymousUser,
        // Account management
        resetPassword,
        linkToGoogle,
        linkToGithub,
        logout,
        // Status
        isLoggedIn: !!user,
        isAnonymous: user?.isAnonymous ?? false,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export default AuthContext;
