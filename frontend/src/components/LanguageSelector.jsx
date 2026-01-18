/**
 * LanguageSelector.jsx - Language selector component
 * 
 * A small icon button that opens a dropdown to select language.
 * Can be used inline (toolbar) or floating (corner).
 */

import { useState, useRef, useEffect } from "react";
import { useLanguage } from "../context/LanguageContext";
import "./LanguageSelector.css";

// Globe icon for language
const GlobeIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="langIcon">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
    </svg>
);

export default function LanguageSelector({ floating = false }) {
    const { language, setLanguage, languages } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(e) {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = (langCode) => {
        setLanguage(langCode);
        setIsOpen(false);
    };

    return (
        <div 
            className={`langSelector ${floating ? "langSelector--floating" : "langSelector--inline"}`} 
            ref={containerRef}
        >
            <button 
                className="langSelector__trigger"
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Select language"
                title="Language"
            >
                <GlobeIcon />
            </button>

            {isOpen && (
                <div className="langSelector__dropdown">
                    {languages.map((lang) => (
                        <button
                            key={lang.code}
                            className={`langSelector__option ${language === lang.code ? "langSelector__option--active" : ""}`}
                            onClick={() => handleSelect(lang.code)}
                        >
                            <span className="langSelector__nativeName">{lang.nativeName}</span>
                            {language === lang.code && (
                                <span className="langSelector__check">✓</span>
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
