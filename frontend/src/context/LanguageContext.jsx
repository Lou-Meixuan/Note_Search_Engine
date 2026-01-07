/**
 * LanguageContext.jsx - 多语言上下文管理
 * 
 * Created by: C (Cheng)
 * Date: 2026-01-07
 * 
 * 功能:
 * - 提供全局语言状态
 * - 保存用户语言偏好到 localStorage
 * - 自动检测浏览器语言
 * - 提供 t() 翻译函数
 */

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import translations, { LANGUAGES } from "../i18n/translations";

// 创建 Context
const LanguageContext = createContext();

// localStorage key
const LS_KEY = "nse_language";

/**
 * 检测浏览器语言
 */
function detectBrowserLanguage() {
    const browserLang = navigator.language || navigator.userLanguage;
    const langCode = browserLang.split("-")[0]; // 'en-US' -> 'en'
    
    // 检查是否支持该语言
    if (translations[langCode]) {
        return langCode;
    }
    return "en"; // 默认英语
}

/**
 * LanguageProvider - 包裹整个 App，提供语言状态
 */
export function LanguageProvider({ children }) {
    // 初始化语言：优先读取 localStorage，否则检测浏览器语言
    const [language, setLanguageState] = useState(() => {
        const saved = localStorage.getItem(LS_KEY);
        if (saved && translations[saved]) {
            return saved;
        }
        return detectBrowserLanguage();
    });

    // 切换语言
    const setLanguage = useCallback((lang) => {
        if (translations[lang]) {
            setLanguageState(lang);
        }
    }, []);

    // 当语言变化时，保存到 localStorage
    useEffect(() => {
        localStorage.setItem(LS_KEY, language);
        // 设置 html lang 属性
        document.documentElement.lang = language;
    }, [language]);

    /**
     * t() - 翻译函数
     * @param {string} key - 翻译键
     * @param {string} fallback - 如果找不到翻译，使用的备用文本
     * @returns {string} 翻译后的文本
     */
    const t = useCallback((key, fallback = "") => {
        const translation = translations[language]?.[key];
        if (translation) return translation;
        
        // 如果当前语言没有，尝试英语
        if (translations.en?.[key]) return translations.en[key];
        
        // 如果都没有，返回 fallback 或 key
        return fallback || key;
    }, [language]);

    return (
        <LanguageContext.Provider value={{ 
            language, 
            setLanguage, 
            t, 
            languages: LANGUAGES 
        }}>
            {children}
        </LanguageContext.Provider>
    );
}

/**
 * useLanguage - Hook 来获取和设置语言
 * 
 * 使用方法:
 * const { language, setLanguage, t } = useLanguage();
 * 
 * // 获取翻译
 * <h1>{t("settings")}</h1>
 * 
 * // 切换语言
 * setLanguage("zh");
 */
export function useLanguage() {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error("useLanguage must be used within a LanguageProvider");
    }
    return context;
}

