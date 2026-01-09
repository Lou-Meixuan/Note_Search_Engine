/**
 * AccountPage.jsx - User account page
 * 
 * Displays user profile and provides sign-in/sign-out functionality.
 * Allows anonymous users to link their account to Google/GitHub.
 * Documents are migrated when linking accounts.
 */

import { useState } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import { API_BASE_URL } from "../config/api";
import "./AccountPage.css";

export default function AccountPage() {
    const { t } = useLanguage();
    const { 
        user, 
        loading, 
        error, 
        signInWithGoogle, 
        signInWithGithub,
        linkToGoogle,
        linkToGithub,
        logout, 
        isLoggedIn,
        isAnonymous 
    } = useAuth();
    const [linkError, setLinkError] = useState(null);
    const [linking, setLinking] = useState(false);

    // Handle Google sign-in
    async function handleGoogleSignIn() {
        try {
            await signInWithGoogle();
        } catch (err) {
            console.error('Sign in failed:', err);
        }
    }

    // Handle GitHub sign-in
    async function handleGithubSignIn() {
        try {
            await signInWithGithub();
        } catch (err) {
            console.error('Sign in failed:', err);
        }
    }

    // Migrate documents from old user to new user
    async function migrateDocuments(fromUserId, toUserId) {
        try {
            const response = await fetch(`${API_BASE_URL}/documents/migrate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fromUserId, toUserId })
            });
            const result = await response.json();
            console.log(`[Migration] Migrated ${result.migratedCount} documents`);
            return result.migratedCount;
        } catch (err) {
            console.error('[Migration] Failed:', err);
            return 0;
        }
    }

    // Handle linking anonymous account to Google
    // Documents are migrated to the linked account
    async function handleLinkGoogle() {
        const oldUserId = user?.uid; // Save old anonymous user ID
        try {
            setLinking(true);
            setLinkError(null);
            const newUser = await linkToGoogle();
            // Migrate documents from anonymous account to linked account
            if (oldUserId && newUser?.uid && oldUserId !== newUser.uid) {
                await migrateDocuments(oldUserId, newUser.uid);
            }
        } catch (err) {
            console.error('Link failed:', err);
            setLinkError(err.message);
        } finally {
            setLinking(false);
        }
    }

    // Handle linking anonymous account to GitHub
    // Documents are migrated to the linked account
    async function handleLinkGithub() {
        const oldUserId = user?.uid; // Save old anonymous user ID
        try {
            setLinking(true);
            setLinkError(null);
            const newUser = await linkToGithub();
            // Migrate documents from anonymous account to linked account
            if (oldUserId && newUser?.uid && oldUserId !== newUser.uid) {
                await migrateDocuments(oldUserId, newUser.uid);
            }
        } catch (err) {
            console.error('Link failed:', err);
            setLinkError(err.message);
        } finally {
            setLinking(false);
        }
    }

    // Handle sign-out
    async function handleSignOut() {
        try {
            await logout();
        } catch (err) {
            console.error('Sign out failed:', err);
        }
    }

    // Loading state
    if (loading) {
        return (
            <div className="acPage">
                <header className="acTopbar">
                    <div className="acLeft">
                        <Link className="acIconBtn" to="/home" aria-label={t("home")}>
                            <svg viewBox="0 0 24 24" className="acIcon">
                                <path d="M12 3l9 8h-3v10h-5v-6H11v6H6V11H3l9-8z" />
                            </svg>
                        </Link>
                    </div>
                    <div className="acCenter">
                        <div className="acTitle">{t("accountTitle")}</div>
                    </div>
                    <div className="acRight" />
                </header>
                <main className="acBody">
                    <div className="acCard">
                        <div className="acLoading">{t("loading") || "Loading..."}</div>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="acPage">
            <header className="acTopbar">
                <div className="acLeft">
                    <Link className="acIconBtn" to="/home" aria-label={t("home")}>
                        <svg viewBox="0 0 24 24" className="acIcon">
                            <path d="M12 3l9 8h-3v10h-5v-6H11v6H6V11H3l9-8z" />
                        </svg>
                    </Link>
                </div>

                <div className="acCenter">
                    <div className="acTitle">{t("accountTitle")}</div>
                </div>

                <div className="acRight">
                    <Link className="acIconBtn" to="/home" aria-label={t("search")}>
                        <svg viewBox="0 0 24 24" className="acIcon">
                            <path d="M10 4a6 6 0 104.472 10.03l4.249 4.248 1.414-1.414-4.248-4.249A6 6 0 0010 4zm0 2a4 4 0 110 8 4 4 0 010-8z" />
                        </svg>
                    </Link>
                    <Link className="acIconBtn" to="/settings" aria-label={t("settings")}>
                        <svg viewBox="0 0 24 24" className="acIcon">
                            <path d="M19.14 12.94a7.43 7.43 0 000-1.88l2.03-1.58-1.92-3.32-2.39.96a7.27 7.27 0 00-1.63-.95l-.36-2.54H9.13l-.36 2.54c-.57.22-1.12.54-1.63.95l-2.39-.96-1.92 3.32 2.03 1.58a7.43 7.43 0 000 1.88L2.83 14.52l1.92 3.32 2.39-.96c.51.41 1.06.73 1.63.95l.36 2.54h5.74l.36-2.54c.57-.22 1.12-.54 1.63-.95l2.39.96 1.92-3.32-2.03-1.58zM12 15.5A3.5 3.5 0 1112 8a3.5 3.5 0 010 7.5z" />
                        </svg>
                    </Link>
                </div>
            </header>

            <main className="acBody">
                <div className="acCard">
                    {/* Error message */}
                    {error && (
                        <div className="acError">{error}</div>
                    )}

                    {isLoggedIn && user && !isAnonymous ? (
                        <>
                            {/* Signed in user */}
                            <div className="acAvatar">
                                {user.photoURL ? (
                                    <img 
                                        src={user.photoURL} 
                                        alt={user.displayName || 'User'} 
                                        className="acAvatarImg"
                                    />
                                ) : (
                                    <svg viewBox="0 0 24 24" className="acAvatarIcon">
                                        <path d="M12 12a4 4 0 10-4-4 4 4 0 004 4zm0 2c-4.42 0-8 2.24-8 5v1h16v-1c0-2.76-3.58-5-8-5z" />
                                    </svg>
                                )}
                            </div>

                            <div className="acName">{user.displayName || 'User'}</div>
                            <div className="acMeta">{user.email}</div>

                            <div className="acGrid">
                                <Info label={t("plan") || "Plan"} value="Free" />
                                <Info 
                                    label={t("memberSince") || "Member since"} 
                                    value={formatDate(user.metadata?.creationTime)} 
                                />
                                <Info label={t("storage") || "Storage"} value="Cloud (Firebase)" />
                                <Info label={t("sync") || "Sync"} value={t("connected") || "Connected"} />
                            </div>

                            <div className="acRow">
                                <button className="acBtn" onClick={handleSignOut}>
                                    {t("logout") || "Sign Out"}
                                </button>
                                <Link className="acBtn ghost" to="/settings">
                                    {t("settings")}
                                </Link>
                            </div>

                            <div className="acHint">
                                {t("signedInHint") || "Your documents are synced with your account."}
                            </div>
                        </>
                    ) : isAnonymous ? (
                        <>
                            {/* Anonymous user - can link account */}
                            <div className="acAvatar">
                                <svg viewBox="0 0 24 24" className="acAvatarIcon">
                                    <path d="M12 12a4 4 0 10-4-4 4 4 0 004 4zm0 2c-4.42 0-8 2.24-8 5v1h16v-1c0-2.76-3.58-5-8-5z" />
                                </svg>
                            </div>

                            <div className="acName">{t("anonymousUser") || "Guest User"}</div>
                            <div className="acMeta">
                                {t("linkAccountHint") || "Link your account to save documents permanently"}
                            </div>

                            {linkError && (
                                <div className="acError">{linkError}</div>
                            )}

                            <div className="acLinkSection">
                                <div className="acLinkTitle">{t("linkAccount") || "Link Account"}</div>
                                <div className="acLinkBtns">
                                    <button 
                                        className="acBtn acGoogleBtn" 
                                        onClick={handleLinkGoogle}
                                        disabled={linking}
                                    >
                                        <svg className="acGoogleIcon" viewBox="0 0 24 24">
                                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                                        </svg>
                                        Google
                                    </button>
                                    <button 
                                        className="acBtn acGithubBtn" 
                                        onClick={handleLinkGithub}
                                        disabled={linking}
                                    >
                                        <svg className="acGithubIcon" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                                        </svg>
                                        GitHub
                                    </button>
                                </div>
                            </div>

                            <div className="acRow">
                                <button className="acBtn ghost" onClick={handleSignOut}>
                                    {t("logout") || "Sign Out"}
                                </button>
                            </div>

                            <div className="acHint acWarning">
                                {t("anonymousWarning") || "Your documents will be deleted if you don't link an account."}
                            </div>
                        </>
                    ) : (
                        <>
                            {/* Not logged in at all */}
                            <div className="acAvatar">
                                <svg viewBox="0 0 24 24" className="acAvatarIcon">
                                    <path d="M12 12a4 4 0 10-4-4 4 4 0 004 4zm0 2c-4.42 0-8 2.24-8 5v1h16v-1c0-2.76-3.58-5-8-5z" />
                                </svg>
                            </div>

                            <div className="acName">{t("notSignedIn") || "Not signed in"}</div>
                            <div className="acMeta">
                                {t("signInHint") || "Sign in to sync your documents across devices."}
                            </div>

                            <div className="acLinkBtns">
                                <button className="acBtn acGoogleBtn" onClick={handleGoogleSignIn}>
                                    <svg className="acGoogleIcon" viewBox="0 0 24 24">
                                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                                    </svg>
                                    Google
                                </button>
                                <button className="acBtn acGithubBtn" onClick={handleGithubSignIn}>
                                    <svg className="acGithubIcon" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                                    </svg>
                                    GitHub
                                </button>
                            </div>

                            <div className="acHint">
                                {t("privacyHint") || "We only use your email for authentication. Your data stays private."}
                            </div>
                        </>
                    )}
                </div>
            </main>
        </div>
    );
}

function Info({ label, value }) {
    return (
        <div className="acInfo">
            <div className="acInfoLabel">{label}</div>
            <div className="acInfoValue">{value}</div>
        </div>
    );
}

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    try {
        const d = new Date(dateString);
        return d.toLocaleDateString();
    } catch {
        return dateString;
    }
}
