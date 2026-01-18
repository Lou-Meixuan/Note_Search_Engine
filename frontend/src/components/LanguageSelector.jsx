/**
 * LanguageSelector.jsx - Floating language selector component
 * 
 * A small corner badge that opens a dropdown to select language.
 */

import { useState, useRef, useEffect } from "react";
import { useLanguage } from "../context/LanguageContext";
import "./LanguageSelector.css";

// Language icon (globe/translate icon)
const LanguageIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" stroke="#6366f1" />
        <path d="M2 12h20" stroke="#6366f1" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" stroke="#6366f1" />
    </svg>
);

export default function LanguageSelector() {
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

    const currentLang = languages.find(l => l.code === language);

    return (
        <div className="langSelector" ref={containerRef}>
            <button 
                className="langSelector__trigger"
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Select language"
            >
                <LanguageIcon />
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
