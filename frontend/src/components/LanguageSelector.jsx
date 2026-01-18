/**
 * LanguageSelector.jsx - Language selector component
 * 
 * A small icon button that opens a dropdown to select language.
 * Can be used inline (toolbar) or floating (corner).
 */

import { useState, useRef, useEffect } from "react";
import { useLanguage } from "../context/LanguageContext";
import "./LanguageSelector.css";

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

    // For inline mode, use the same classes as other toolbar icons
    if (!floating) {
        return (
            <div className="langSelector langSelector--inline" ref={containerRef}>
                <button 
                    className="spIconBtn"
                    onClick={() => setIsOpen(!isOpen)}
                    aria-label="Select language"
                    title="Language"
                >
                    {/* Simple globe icon */}
                    <svg 
                        viewBox="0 0 24 24" 
                        style={{ width: 22, height: 22, minWidth: 22, stroke: 'var(--icon-fill, #1d1d1f)', fill: 'none', strokeWidth: 2 }}
                    >
                        <circle cx="12" cy="12" r="9"/>
                        <ellipse cx="12" cy="12" rx="3.5" ry="9"/>
                        <path d="M3 12h18"/>
                    </svg>
                </button>

                {isOpen && (
                    <div className="langSelector__dropdown langSelector__dropdown--inline">
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

    // Floating mode for pages without toolbar (like login page)
    return (
        <div className="langSelector langSelector--floating" ref={containerRef}>
            <button 
                className="langSelector__trigger--floating"
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Select language"
                title="Language"
            >
                <svg 
                    viewBox="0 0 24 24" 
                    style={{ width: 26, height: 26, minWidth: 26, stroke: 'var(--icon-fill, #1d1d1f)', fill: 'none', strokeWidth: 2 }}
                >
                    <circle cx="12" cy="12" r="9"/>
                    <ellipse cx="12" cy="12" rx="3.5" ry="9"/>
                    <path d="M3 12h18"/>
                </svg>
            </button>

            {isOpen && (
                <div className="langSelector__dropdown langSelector__dropdown--floating">
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
