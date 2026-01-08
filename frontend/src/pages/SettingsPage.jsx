/**
 * SettingsPage.jsx - Application settings
 * 
 * Language selection, theme customization, and reset options.
 */

import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useLanguage } from "../context/LanguageContext";
import { useColorTheme } from "../context/ColorThemeContext";
import { API } from "../config/api";
import "./SettingsPage.css";

const LS_KEY = "nse_settings_v1";

const DEFAULT_SETTINGS = {
    layout: "split",  // split | focusRemote | focusLocal
};

export default function SettingsPage() {
    const [settings, setSettings] = useState(DEFAULT_SETTINGS);
    const [savedMsg, setSavedMsg] = useState("");
    const { language, setLanguage, t, languages } = useLanguage();
    const { mode, setMode, theme, setTheme, themes, isDark } = useColorTheme();

    // load
    useEffect(() => {
        try {
            const raw = localStorage.getItem(LS_KEY);
            if (!raw) return;
            const parsed = JSON.parse(raw);
            setSettings((prev) => ({ ...prev, ...parsed }));
        } catch {
            // ignore
        }
    }, []);

    // save
    useEffect(() => {
        localStorage.setItem(LS_KEY, JSON.stringify(settings));
    }, [settings]);

    function saveToast() {
        setSavedMsg(t("saved"));
        window.clearTimeout(saveToast._t);
        saveToast._t = window.setTimeout(() => setSavedMsg(""), 1200);
    }

    function update(patch) {
        setSettings((s) => ({ ...s, ...patch }));
        saveToast();
    }

    function handleLanguageChange(langCode) {
        setLanguage(langCode);
        saveToast();
    }

    function handleModeChange(newMode) {
        setMode(newMode);
        saveToast();
    }

    function handleThemeChange(themeId) {
        setTheme(themeId);
        saveToast();
    }

    return (
        <div className="stPage">
            <header className="stTopbar">
                <div className="stLeft">
                    <Link className="stIconBtn" to="/home" aria-label={t("home")}>
                        <svg viewBox="0 0 24 24" className="stIcon">
                            <path d="M12 3l9 8h-3v10h-5v-6H11v6H6V11H3l9-8z" />
                        </svg>
                    </Link>
                </div>

                <div className="stCenter">
                    <div className="stTitle">{t("settingsTitle")}</div>
                    {savedMsg ? <div className="stSaved">{savedMsg}</div> : null}
                </div>

                <div className="stRight">
                    <Link className="stIconBtn" to="/home" aria-label={t("search")}>
                        <svg viewBox="0 0 24 24" className="stIcon">
                            <path d="M10 4a6 6 0 104.472 10.03l4.249 4.248 1.414-1.414-4.248-4.249A6 6 0 0010 4zm0 2a4 4 0 110 8 4 4 0 010-8z" />
                        </svg>
                    </Link>
                    <Link className="stIconBtn" to="/account" aria-label={t("account")}>
                        <svg viewBox="0 0 24 24" className="stIcon">
                            <path d="M12 12a4 4 0 10-4-4 4 4 0 004 4zm0 2c-4.42 0-8 2.24-8 5v1h16v-1c0-2.76-3.58-5-8-5z" />
                        </svg>
                    </Link>
                </div>
            </header>

            <main className="stBody">
                {/* Light/Dark Mode */}
                <div className="stCard">
                    <div className="stCardTitle">🌓 {t("appearance") || "Appearance"}</div>
                    <div className="stRow">
                        <button
                            className={`stPill ${mode === "light" ? "isActive" : ""}`}
                            onClick={() => handleModeChange("light")}
                        >
                            ☀️ {t("lightMode")}
                        </button>
                        <button
                            className={`stPill ${mode === "dark" ? "isActive" : ""}`}
                            onClick={() => handleModeChange("dark")}
                        >
                            🌙 {t("darkMode")}
                        </button>
                    </div>
                </div>

                {/* Color Theme Presets */}
                <div className="stCard">
                    <div className="stCardTitle">🎨 {t("colorTheme") || "Color Theme"}</div>
                    <div className="stHint">
                        {isDark 
                            ? (t("darkThemesHint") || "Dark themes") 
                            : (t("lightThemesHint") || "Light themes")}
                    </div>
                    
                    <div className="stThemeGrid">
                        {themes.map((themeGroup) => {
                            const preview = isDark ? themeGroup.darkPreview : themeGroup.lightPreview;
                            // Get translated theme name by id
                            const themeNameKey = `theme${themeGroup.id.charAt(0).toUpperCase() + themeGroup.id.slice(1)}`;
                            const translatedName = t(themeNameKey) || themeGroup.name;
                            return (
                        <button
                                    key={themeGroup.id}
                                    className={`stThemeCard ${theme === themeGroup.id ? "isActive" : ""}`}
                                    onClick={() => handleThemeChange(themeGroup.id)}
                        >
                                    <div className="stThemePreview">
                                        <div 
                                            className="stThemePreviewBg" 
                                            style={{ background: preview.bg }}
                                        >
                                            <div 
                                                className="stThemePreviewCard"
                                                style={{ background: preview.card }}
                                            />
                                            <div 
                                                className="stThemePreviewAccent"
                                                style={{ background: preview.accent }}
                                            />
                                        </div>
                                    </div>
                                    <div className="stThemeName">{translatedName}</div>
                        </button>
                            );
                        })}
                    </div>
                </div>

                {/* Language */}
                <div className="stCard">
                    <div className="stCardTitle">🌐 {t("language")}</div>
                    <div className="stLanguageGrid">
                        {languages.map((lang) => (
                            <button
                                key={lang.code}
                                className={`stLanguageBtn ${language === lang.code ? "isActive" : ""}`}
                                onClick={() => handleLanguageChange(lang.code)}
                            >
                                <span className="stLangNative">{lang.nativeName}</span>
                                <span className="stLangName">{lang.name}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Reset Settings */}
                <div className="stCard">
                    <div className="stCardTitle">🔄 {t("resetSettings")}</div>
                    <div className="stRow">
                        <button
                            className="stPill stResetBtn"
                            onClick={async () => {
                                // Clear uploaded files
                                try {
                                    const res = await fetch(API.documents);
                                    if (res.ok) {
                                        const docs = await res.json();
                                        for (const doc of docs) {
                                            if (doc.id) {
                                                await fetch(API.documentById(doc.id), {
                                                    method: 'DELETE'
                                                });
                                            }
                                        }
                                    }
                                } catch (e) {
                                    console.error('Failed to clear documents:', e);
                                }
                                // Reset theme to default
                                setTheme("default");
                                // Reset mode to light
                                setMode("light");
                                // Reset settings
                                localStorage.removeItem(LS_KEY);
                                setSettings(DEFAULT_SETTINGS);
                                saveToast();
                            }}
                        >
                            {t("resetDefault")}
                        </button>
                    </div>
                    <div className="stHint">{t("resetHint")}</div>
                </div>
            </main>
        </div>
    );
}
