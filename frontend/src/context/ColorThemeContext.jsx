/**
 * ColorThemeContext.jsx - 颜色主题上下文管理
 * 
 * Created by: C (Cheng)
 * Date: 2026-01-07
 * 
 * 功能:
 * - 提供全局颜色主题状态
 * - 管理 Light/Dark 模式
 * - 每个模式有多个主题可选
 */

import { createContext, useContext, useEffect, useState, useCallback } from "react";

// 创建 Context
const ColorThemeContext = createContext();

// localStorage keys
const LS_MODE_KEY = "nse_mode";      // light | dark
const LS_THEME_KEY = "nse_theme";    // default | dracula | nord | ...

/**
 * 预设主题列表
 */
export const THEME_GROUPS = [
    {
        id: "default",
        name: "Default",
        nameZh: "默认",
        lightPreview: { bg: "#ffffff", accent: "#0071e3", card: "#f5f5f7" },
        darkPreview: { bg: "#000000", accent: "#0a84ff", card: "#1c1c1e" },
    },
    {
        id: "dracula",
        name: "Dracula",
        nameZh: "德古拉",
        lightPreview: { bg: "#f8f8f2", accent: "#bd93f9", card: "#e8e8e2" },
        darkPreview: { bg: "#282a36", accent: "#bd93f9", card: "#44475a" },
    },
    {
        id: "nord",
        name: "Nord",
        nameZh: "北欧",
        lightPreview: { bg: "#eceff4", accent: "#5e81ac", card: "#e5e9f0" },
        darkPreview: { bg: "#2e3440", accent: "#88c0d0", card: "#3b4252" },
    },
    {
        id: "catppuccin",
        name: "Catppuccin",
        nameZh: "奶茶",
        lightPreview: { bg: "#eff1f5", accent: "#8839ef", card: "#e6e9ef" },
        darkPreview: { bg: "#1e1e2e", accent: "#cba6f7", card: "#313244" },
    },
    {
        id: "solarized",
        name: "Solarized",
        nameZh: "日晒",
        lightPreview: { bg: "#fdf6e3", accent: "#268bd2", card: "#eee8d5" },
        darkPreview: { bg: "#002b36", accent: "#268bd2", card: "#073642" },
    },
    {
        id: "monokai",
        name: "Monokai",
        nameZh: "Monokai",
        lightPreview: { bg: "#fafafa", accent: "#a6e22e", card: "#f0f0f0" },
        darkPreview: { bg: "#272822", accent: "#a6e22e", card: "#3e3d32" },
    },
];

/**
 * ColorThemeProvider - 包裹整个 App，提供颜色主题状态
 */
export function ColorThemeProvider({ children }) {
    // 模式: light | dark
    const [mode, setModeState] = useState(() => {
        const saved = localStorage.getItem(LS_MODE_KEY);
        if (saved === "light" || saved === "dark") {
            return saved;
        }
        // 检测系统偏好
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? "dark" : "light";
    });

    // 主题: default | dracula | nord | ...
    const [theme, setThemeState] = useState(() => {
        const saved = localStorage.getItem(LS_THEME_KEY);
        if (saved && THEME_GROUPS.find(t => t.id === saved)) {
            return saved;
        }
        return "default";
    });

    // 设置模式
    const setMode = useCallback((newMode) => {
        if (newMode === "light" || newMode === "dark") {
            setModeState(newMode);
        }
    }, []);

    // 切换模式
    const toggleMode = useCallback(() => {
        setModeState(prev => prev === "light" ? "dark" : "light");
    }, []);

    // 设置主题
    const setTheme = useCallback((themeId) => {
        if (THEME_GROUPS.find(t => t.id === themeId)) {
            setThemeState(themeId);
        }
    }, []);

    const isDark = mode === "dark";
    const currentThemeGroup = THEME_GROUPS.find(t => t.id === theme) || THEME_GROUPS[0];

    // 当模式或主题变化时，保存并应用
    useEffect(() => {
        localStorage.setItem(LS_MODE_KEY, mode);
        localStorage.setItem(LS_THEME_KEY, theme);
        
        // 组合 CSS 属性：theme-mode (如 default-dark, dracula-light)
        const colorThemeId = `${theme}-${mode}`;
        document.documentElement.setAttribute("data-color-theme", colorThemeId);
        document.documentElement.setAttribute("data-theme", mode);
    }, [mode, theme]);

    return (
        <ColorThemeContext.Provider value={{ 
            mode,
            setMode,
            toggleMode,
            theme,
            setTheme,
            themes: THEME_GROUPS,
            isDark,
            currentThemeGroup,
        }}>
            {children}
        </ColorThemeContext.Provider>
    );
}

/**
 * useColorTheme - Hook 来获取和设置颜色主题
 */
export function useColorTheme() {
    const context = useContext(ColorThemeContext);
    if (!context) {
        throw new Error("useColorTheme must be used within a ColorThemeProvider");
    }
    return context;
}
