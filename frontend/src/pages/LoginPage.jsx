/**
 * LoginPage.jsx - Login/Welcome page
 * 
 * Supports: Google, GitHub, Email/Password, and Anonymous sign-in.
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import './LoginPage.css';

export default function LoginPage() {
    const navigate = useNavigate();
    const { 
        signInWithGoogle, 
        signInWithGithub, 
        signInWithEmail, 
        signUpWithEmail,
        signInAnonymousUser,
        isLoggedIn, 
        loading 
    } = useAuth();
    const { t } = useLanguage();
    
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMethod, setLoadingMethod] = useState(null);
    const [error, setError] = useState(null);
    const [mounted, setMounted] = useState(false);
    
    // Email form state
    const [showEmailForm, setShowEmailForm] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [displayName, setDisplayName] = useState('');

    useEffect(() => {
        setMounted(true);
    }, []);

    // Redirect if already logged in
    useEffect(() => {
        if (isLoggedIn && !loading) {
            navigate('/home', { replace: true });
        }
    }, [isLoggedIn, loading, navigate]);

    // Handle social sign-in
    async function handleSocialSignIn(provider) {
        try {
            setIsLoading(true);
            setLoadingMethod(provider);
            setError(null);
            
            if (provider === 'google') {
                await signInWithGoogle();
            } else if (provider === 'github') {
                await signInWithGithub();
            }
            // Navigation will be handled by useEffect when isLoggedIn becomes true
        } catch (err) {
            console.error('Login error:', err);
            // Handle account-exists-with-different-credential error
            let errorMsg = err.message;
            if (err.code === 'auth/account-exists-with-different-credential') {
                errorMsg = t('accountExistsWithDifferentCredential') || 
                    'This email is already registered with another sign-in method. Please use the original method.';
            }
            setError(errorMsg);
            setIsLoading(false);
            setLoadingMethod(null);
        }
    }

    // Handle email form submit
    async function handleEmailSubmit(e) {
        e.preventDefault();
        try {
            setIsLoading(true);
            setLoadingMethod('email');
            setError(null);
            
            if (isSignUp) {
                await signUpWithEmail(email, password, displayName);
            } else {
                await signInWithEmail(email, password);
            }
            // Navigation will be handled by useEffect when isLoggedIn becomes true
        } catch (err) {
            console.error('Email auth error:', err);
            // Translate common Firebase errors
            let errorMsg = err.message;
            if (err.code === 'auth/email-already-in-use') {
                errorMsg = t('emailInUse') || 'Email already in use';
            } else if (err.code === 'auth/invalid-email') {
                errorMsg = t('invalidEmail') || 'Invalid email address';
            } else if (err.code === 'auth/weak-password') {
                errorMsg = t('weakPassword') || 'Password must be at least 6 characters';
            } else if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
                errorMsg = t('invalidCredentials') || 'Invalid email or password';
            }
            setError(errorMsg);
            setIsLoading(false);
            setLoadingMethod(null);
        }
    }

    // Handle anonymous sign-in
    async function handleAnonymousSignIn() {
        try {
            setIsLoading(true);
            setLoadingMethod('anonymous');
            setError(null);
            await signInAnonymousUser();
            // Navigation will be handled by useEffect when isLoggedIn becomes true
        } catch (err) {
            console.error('Anonymous login error:', err);
            setError(err.message || 'Anonymous sign in failed');
            setIsLoading(false);
            setLoadingMethod(null);
        }
    }

    // Skip login (guest mode without any auth)
    function handleSkip() {
        navigate('/home');
    }

    if (loading) {
        return (
            <div className="loginPage">
                <div className="loginLoader">
                    <div className="loginSpinner"></div>
                </div>
            </div>
        );
    }

    return (
        <div className={`loginPage ${mounted ? 'mounted' : ''}`}>
            {/* Background decoration */}
            <div className="loginBgPattern">
                <div className="loginOrb loginOrb1"></div>
                <div className="loginOrb loginOrb2"></div>
                <div className="loginOrb loginOrb3"></div>
            </div>

            {/* Main card */}
            <div className="loginCard">
                {/* Logo section */}
                <div className="loginLogo">
                    <div className="loginLogoIcon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                        </svg>
                    </div>
                    <h1 className="loginTitle">Note Search Engine</h1>
                    <p className="loginSubtitle">{t('loginSubtitle')}</p>
                </div>

                {/* Login options */}
                <div className="loginOptions">
                    {/* Social login buttons */}
                    <div className="loginSocialBtns">
                        {/* Google */}
                        <button 
                            className="loginSocialBtn loginGoogleBtn"
                            onClick={() => handleSocialSignIn('google')}
                            disabled={isLoading}
                        >
                            {loadingMethod === 'google' ? (
                                <div className="loginBtnSpinner"></div>
                            ) : (
                                <>
                                    <svg className="socialIcon" viewBox="0 0 24 24">
                                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                                    </svg>
                                    <span>Google</span>
                                </>
                            )}
                        </button>

                        {/* GitHub */}
                        <button 
                            className="loginSocialBtn loginGithubBtn"
                            onClick={() => handleSocialSignIn('github')}
                            disabled={isLoading}
                        >
                            {loadingMethod === 'github' ? (
                                <div className="loginBtnSpinner"></div>
                            ) : (
                                <>
                                    <svg className="socialIcon" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                                    </svg>
                                    <span>GitHub</span>
                                </>
                            )}
                        </button>
                    </div>

                    {/* Divider */}
                    <div className="loginDivider">
                        <span>{t('or')}</span>
                    </div>

                    {/* Email form toggle */}
                    {!showEmailForm ? (
                        <button 
                            className="loginEmailToggle"
                            onClick={() => setShowEmailForm(true)}
                            disabled={isLoading}
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                            </svg>
                            <span>{t('signInWithEmail') || 'Sign in with Email'}</span>
                        </button>
                    ) : (
                        <form className="loginEmailForm" onSubmit={handleEmailSubmit}>
                            {isSignUp && (
                                <input
                                    type="text"
                                    placeholder={t('displayName') || 'Display Name'}
                                    value={displayName}
                                    onChange={(e) => setDisplayName(e.target.value)}
                                    className="loginInput"
                                />
                            )}
                            <input
                                type="email"
                                placeholder={t('email') || 'Email'}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="loginInput"
                            />
                            <input
                                type="password"
                                placeholder={t('password') || 'Password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={6}
                                className="loginInput"
                            />
                            <button 
                                type="submit" 
                                className="loginEmailSubmit"
                                disabled={isLoading}
                            >
                                {loadingMethod === 'email' ? (
                                    <div className="loginBtnSpinner"></div>
                                ) : (
                                    isSignUp ? (t('signUp') || 'Sign Up') : (t('signIn') || 'Sign In')
                                )}
                            </button>
                            <button 
                                type="button"
                                className="loginEmailSwitch"
                                onClick={() => setIsSignUp(!isSignUp)}
                            >
                                {isSignUp 
                                    ? (t('haveAccount') || 'Already have an account? Sign In')
                                    : (t('needAccount') || "Don't have an account? Sign Up")
                                }
                            </button>
                            <button 
                                type="button"
                                className="loginEmailCancel"
                                onClick={() => {
                                    setShowEmailForm(false);
                                    setEmail('');
                                    setPassword('');
                                    setDisplayName('');
                                    setError(null);
                                }}
                            >
                                {t('cancel') || 'Cancel'}
                            </button>
                        </form>
                    )}

                    {/* Continue without sign in (uses anonymous auth, can upgrade later) */}
                    <button 
                        className="loginSkipBtn"
                        onClick={handleAnonymousSignIn}
                        disabled={isLoading}
                    >
                        {loadingMethod === 'anonymous' ? (
                            <div className="loginBtnSpinner"></div>
                        ) : (
                            t('continueWithoutSignIn') || 'Continue without Sign In'
                        )}
                    </button>

                    {/* Warning notice */}
                    <div className="loginWarning">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10"/>
                            <line x1="12" y1="8" x2="12" y2="12"/>
                            <line x1="12" y1="16" x2="12.01" y2="16"/>
                        </svg>
                        <span>{t('guestWarning')}</span>
                    </div>
                </div>

                {/* Error notice */}
                {error && (
                    <div className="loginError">
                        {error}
                    </div>
                )}

                {/* Features */}
                <div className="loginFeatures">
                    <div className="loginFeature">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                        </svg>
                        <span>{t('featureSearch')}</span>
                    </div>
                    <div className="loginFeature">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                        </svg>
                        <span>{t('featureUpload')}</span>
                    </div>
                    <div className="loginFeature">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                        </svg>
                        <span>{t('featureSync')}</span>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="loginFooter">
                <p>© 2026 Note Search Engine. Made with ♥</p>
            </div>
        </div>
    );
}

