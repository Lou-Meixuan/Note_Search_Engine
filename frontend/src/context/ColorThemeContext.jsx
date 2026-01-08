/**
 * ColorThemeContext.jsx - Color theme context
 * 
 * Manages global color theme state with light/dark mode support.
 * Each theme has both light and dark variants.
 */

import { createContext, useContext, useEffect, useState, useCallback } from "react";

const ColorThemeContext = createContext();

const LS_MODE_KEY = "nse_mode";
const LS_THEME_KEY = "nse_theme";

/**
 * Available theme presets
 */
export const THEME_GROUPS = [
    {
        id: "default",
        name: "Default",
        lightPreview: { bg: "#ffffff", accent: "#0071e3", card: "#f5f5f7" },
        darkPreview: { bg: "#000000", accent: "#0a84ff", card: "#1c1c1e" },
    },
    {
        id: "dracula",
        name: "Dracula",
        lightPreview: { bg: "#f8f8f2", accent: "#bd93f9", card: "#e8e8e2" },
        darkPreview: { bg: "#282a36", accent: "#bd93f9", card: "#44475a" },
    },
    {
        id: "nord",
        name: "Nord",
        lightPreview: { bg: "#eceff4", accent: "#5e81ac", card: "#e5e9f0" },
        darkPreview: { bg: "#2e3440", accent: "#88c0d0", card: "#3b4252" },
    },
    {
        id: "catppuccin",
        name: "Catppuccin",
        lightPreview: { bg: "#eff1f5", accent: "#8839ef", card: "#e6e9ef" },
        darkPreview: { bg: "#1e1e2e", accent: "#cba6f7", card: "#313244" },
    },
    {
        id: "solarized",
        name: "Solarized",
        lightPreview: { bg: "#fdf6e3", accent: "#268bd2", card: "#eee8d5" },
        darkPreview: { bg: "#002b36", accent: "#268bd2", card: "#073642" },
    },
    {
        id: "monokai",
        name: "Monokai",
        lightPreview: { bg: "#fafafa", accent: "#a6e22e", card: "#f0f0f0" },
        darkPreview: { bg: "#272822", accent: "#a6e22e", card: "#3e3d32" },
    },
];

export function ColorThemeProvider({ children }) {
    const [mode, setModeState] = useState(() => {
        const saved = localStorage.getItem(LS_MODE_KEY);
        if (saved === "light" || saved === "dark") {
            return saved;
        }
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? "dark" : "light";
    });

    const [theme, setThemeState] = useState(() => {
        const saved = localStorage.getItem(LS_THEME_KEY);
        if (saved && THEME_GROUPS.find(t => t.id === saved)) {
            return saved;
        }
        return "default";
    });

    const setMode = useCallback((newMode) => {
        if (newMode === "light" || newMode === "dark") {
            setModeState(newMode);
        }
    }, []);

    const toggleMode = useCallback(() => {
        setModeState(prev => prev === "light" ? "dark" : "light");
    }, []);

    const setTheme = useCallback((themeId) => {
        if (THEME_GROUPS.find(t => t.id === themeId)) {
            setThemeState(themeId);
        }
    }, []);

    const isDark = mode === "dark";
    const currentThemeGroup = THEME_GROUPS.find(t => t.id === theme) || THEME_GROUPS[0];

    useEffect(() => {
        localStorage.setItem(LS_MODE_KEY, mode);
        localStorage.setItem(LS_THEME_KEY, theme);
        
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

export function useColorTheme() {
    const context = useContext(ColorThemeContext);
    if (!context) {
        throw new Error("useColorTheme must be used within a ColorThemeProvider");
    }
    return context;
}
