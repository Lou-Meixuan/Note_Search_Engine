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
                    {/* Translate/Language icon - matching spIcon style */}
                    <svg viewBox="0 0 24 24" className="spIcon">
                        <path d="M12.87 15.07l-2.54-2.51.03-.03A17.52 17.52 0 0014.07 6H17V4h-7V2H8v2H1v2h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z"/>
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
                <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                    <path d="M12.87 15.07l-2.54-2.51.03-.03A17.52 17.52 0 0014.07 6H17V4h-7V2H8v2H1v2h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z"/>
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
