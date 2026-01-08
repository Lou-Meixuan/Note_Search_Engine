/**
 * LanguageContext.jsx - Multi-language context
 * 
 * Manages global language state with browser language detection.
 * Provides t() translation function for internationalization.
 */

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import translations, { LANGUAGES } from "../i18n/translations";

const LanguageContext = createContext();
const LS_KEY = "nse_language";

function detectBrowserLanguage() {
    const browserLang = navigator.language || navigator.userLanguage;
    const langCode = browserLang.split("-")[0];
    
    if (translations[langCode]) {
        return langCode;
    }
    return "en";
}

export function LanguageProvider({ children }) {
    const [language, setLanguageState] = useState(() => {
        const saved = localStorage.getItem(LS_KEY);
        if (saved && translations[saved]) {
            return saved;
        }
        return detectBrowserLanguage();
    });

    const setLanguage = useCallback((lang) => {
        if (translations[lang]) {
            setLanguageState(lang);
        }
    }, []);

    useEffect(() => {
        localStorage.setItem(LS_KEY, language);
        document.documentElement.lang = language;
    }, [language]);

    const t = useCallback((key, fallback = "") => {
        const translation = translations[language]?.[key];
        if (translation) return translation;
        if (translations.en?.[key]) return translations.en[key];
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

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error("useLanguage must be used within a LanguageProvider");
    }
    return context;
}
