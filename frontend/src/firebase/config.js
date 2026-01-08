/**
 * Firebase 配置文件
 * 
 * Created by: C
 * Date: 2026-01-08
 * 
 * 使用说明:
 * 1. 访问 https://console.firebase.google.com/
 * 2. 创建新项目或选择现有项目
 * 3. 在 Project Settings -> General -> Your apps 中创建 Web app
 * 4. 复制配置到下面的 firebaseConfig 对象中
 * 5. 在 Authentication -> Sign-in method 中启用 Google 登录
 */

import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

// TODO: 替换为你的 Firebase 配置
// 从 Firebase Console -> Project Settings -> Your apps -> Web app 获取
const firebaseConfig = {
    apiKey: "AIzaSyCZ1F4Cr9difHqIs20x-PEJp_0KNcBLw-g",
    authDomain: "note-search-engine-mlc.firebaseapp.com",
    projectId: "note-search-engine-mlc",
    storageBucket: "note-search-engine-mlc.firebasestorage.app",
    messagingSenderId: "363828046798",
    appId: "1:363828046798:web:5c1bcb4467e3b23e37199f"
};

// 初始化 Firebase
const app = initializeApp(firebaseConfig);

// 获取 Auth 实例
export const auth = getAuth(app);

// Google 登录提供者
export const googleProvider = new GoogleAuthProvider();

export default app;

