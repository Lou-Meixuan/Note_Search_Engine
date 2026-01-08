/**
 * LoginPage.jsx - 登录页面
 * 
 * Created by: C
 * Date: 2026-01-08
 * 
 * 功能:
 * - Google 登录
 * - 跳过登录（访客模式）
 * - 多语言支持
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import './LoginPage.css';

export default function LoginPage() {
    const navigate = useNavigate();
    const { signInWithGoogle, isLoggedIn, loading } = useAuth();
    const { t } = useLanguage();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [mounted, setMounted] = useState(false);

    // 动画挂载效果
    useEffect(() => {
        setMounted(true);
    }, []);

    // 如果已登录，跳转到主页
    useEffect(() => {
        if (isLoggedIn && !loading) {
            navigate('/home');
        }
    }, [isLoggedIn, loading, navigate]);

    // Google 登录处理
    async function handleGoogleSignIn() {
        try {
            setIsLoading(true);
            setError(null);
            await signInWithGoogle();
            navigate('/home');
        } catch (err) {
            console.error('Login error:', err);
            setError(t('loginError') || 'Sign in failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    }

    // 跳过登录（访客模式）
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
            {/* 背景装饰 */}
            <div className="loginBgPattern">
                <div className="loginOrb loginOrb1"></div>
                <div className="loginOrb loginOrb2"></div>
                <div className="loginOrb loginOrb3"></div>
            </div>

            {/* 主卡片 */}
            <div className="loginCard">
                {/* Logo 区域 */}
                <div className="loginLogo">
                    <div className="loginLogoIcon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                        </svg>
                    </div>
                    <h1 className="loginTitle">Note Search Engine</h1>
                    <p className="loginSubtitle">{t('loginSubtitle')}</p>
                </div>

                {/* 登录选项 */}
                <div className="loginOptions">
                    {/* Google 登录按钮 */}
                    <button 
                        className="loginGoogleBtn"
                        onClick={handleGoogleSignIn}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <div className="loginBtnSpinner"></div>
                        ) : (
                            <>
                                <svg className="googleIcon" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                                </svg>
                                <span>{t('signInWithGoogle')}</span>
                            </>
                        )}
                    </button>

                    {/* 分隔线 */}
                    <div className="loginDivider">
                        <span>{t('or')}</span>
                    </div>

                    {/* 跳过按钮 */}
                    <button 
                        className="loginSkipBtn"
                        onClick={handleSkip}
                        disabled={isLoading}
                    >
                        {t('continueWithoutSignIn')}
                    </button>

                    {/* 警告提示 */}
                    <div className="loginWarning">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10"/>
                            <line x1="12" y1="8" x2="12" y2="12"/>
                            <line x1="12" y1="16" x2="12.01" y2="16"/>
                        </svg>
                        <span>{t('guestWarning')}</span>
                    </div>
                </div>

                {/* 错误提示 */}
                {error && (
                    <div className="loginError">
                        {error}
                    </div>
                )}

                {/* 功能特性 */}
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

            {/* 底部版权 */}
            <div className="loginFooter">
                <p>© 2026 Note Search Engine. Made with ♥</p>
            </div>
        </div>
    );
}

