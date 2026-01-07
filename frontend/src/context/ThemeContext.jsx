/**
 * ThemeContext.jsx - 主题上下文管理
 * 
 * Created by: C (Cheng)
 * Date: 2026-01-07
 * 
 * 功能:
 * - 提供全局主题状态 (light / dark)
 * - 保存用户偏好到 localStorage
 * - 自动检测系统主题偏好
 */

import { createContext, useContext, useEffect, useState } from "react";

// 创建 Context
const ThemeContext = createContext();

/**
 * ThemeProvider - 包裹整个 App，提供主题状态
 */
export function ThemeProvider({ children }) {
    // 初始化主题：优先读取 localStorage，否则检测系统偏好
    const [theme, setTheme] = useState(() => {
        const saved = localStorage.getItem("theme");
        if (saved) return saved;
        
        // 检测系统偏好
        if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
            return "dark";
        }
        return "light";
    });

    // 切换主题
    const toggleTheme = () => {
        setTheme(prev => prev === "light" ? "dark" : "light");
    };

    // 当主题变化时，更新 document 和 localStorage
    useEffect(() => {
        document.documentElement.setAttribute("data-theme", theme);
        localStorage.setItem("theme", theme);
    }, [theme]);

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

/**
 * useTheme - Hook 来获取和切换主题
 * 
 * 使用方法:
 * const { theme, toggleTheme } = useTheme();
 */
export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    return context;
}

