/**
 * AuthContext.jsx - 用户认证上下文
 * 
 * Created by: C
 * Date: 2026-01-08
 * 
 * 功能:
 * - 管理用户登录状态
 * - 提供 Google 登录/登出方法
 * - 在整个应用中共享用户信息
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
    signInWithPopup, 
    signOut, 
    onAuthStateChanged 
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase/config';

// 创建 Context
const AuthContext = createContext(null);

// 自定义 Hook，方便使用 AuthContext
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

// AuthProvider 组件
export function AuthProvider({ children }) {
    // 当前用户
    const [user, setUser] = useState(null);
    // 加载状态
    const [loading, setLoading] = useState(true);
    // 错误信息
    const [error, setError] = useState(null);

    // 监听用户登录状态变化
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
        });

        // 清理订阅
        return () => unsubscribe();
    }, []);

    // Google 登录
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

    // 登出
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

    // 提供给子组件的值
    const value = {
        user,           // 当前用户对象 (null 表示未登录)
        loading,        // 是否正在加载用户状态
        error,          // 错误信息
        signInWithGoogle, // Google 登录方法
        logout,         // 登出方法
        isLoggedIn: !!user, // 是否已登录
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export default AuthContext;

