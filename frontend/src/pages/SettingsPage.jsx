import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import "./SettingsPage.css";

const LS_KEY = "nse_settings_v1";

const DEFAULT_SETTINGS = {
    accent: "orange", // orange | blue | green | purple | mono
    language: "en",   // en | zh
    layout: "split",  // split | focusRemote | focusLocal
};

export default function SettingsPage() {
    const [settings, setSettings] = useState(DEFAULT_SETTINGS);
    const [savedMsg, setSavedMsg] = useState("");

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

    // save + apply theme variables
    useEffect(() => {
        localStorage.setItem(LS_KEY, JSON.stringify(settings));
        applyTheme(settings.accent);
    }, [settings]);

    const palette = useMemo(
        () => ({
            orange: { name: "Orange", value: "#d86a3a" },
            blue: { name: "Blue", value: "#2e6ee6" },
            green: { name: "Green", value: "#2e9b77" },
            purple: { name: "Purple", value: "#7c4dff" },
            mono: { name: "Mono", value: "#111111" },
        }),
        []
    );

    function applyTheme(accent) {
        const color = palette[accent]?.value || palette.orange.value;
        document.documentElement.style.setProperty("--accent", color);
    }

    function saveToast() {
        setSavedMsg("Saved ✔");
        window.clearTimeout(saveToast._t);
        saveToast._t = window.setTimeout(() => setSavedMsg(""), 1200);
    }

    function update(patch) {
        setSettings((s) => ({ ...s, ...patch }));
        saveToast();
    }

    return (
        <div className="stPage">
            <header className="stTopbar">
                <div className="stLeft">
                    <Link className="stIconBtn" to="/" aria-label="Home">
                        <svg viewBox="0 0 24 24" className="stIcon">
                            <path d="M12 3l9 8h-3v10h-5v-6H11v6H6V11H3l9-8z" />
                        </svg>
                    </Link>
                </div>

                <div className="stCenter">
                    <div className="stTitle">Settings</div>
                    {savedMsg ? <div className="stSaved">{savedMsg}</div> : null}
                </div>

                <div className="stRight">
                    <Link className="stIconBtn" to="/search" aria-label="Search">
                        <svg viewBox="0 0 24 24" className="stIcon">
                            <path d="M10 4a6 6 0 104.472 10.03l4.249 4.248 1.414-1.414-4.248-4.249A6 6 0 0010 4zm0 2a4 4 0 110 8 4 4 0 010-8z" />
                        </svg>
                    </Link>
                    <Link className="stIconBtn" to="/account" aria-label="Account">
                        <svg viewBox="0 0 24 24" className="stIcon">
                            <path d="M12 12a4 4 0 10-4-4 4 4 0 004 4zm0 2c-4.42 0-8 2.24-8 5v1h16v-1c0-2.76-3.58-5-8-5z" />
                        </svg>
                    </Link>
                </div>
            </header>

            <main className="stBody">
                <div className="stCard">
                    <div className="stCardTitle">Theme Color (accent)</div>
                    <div className="stRow">
                        {Object.entries(palette).map(([key, info]) => (
                            <button
                                key={key}
                                className={`stSwatch ${settings.accent === key ? "isActive" : ""}`}
                                onClick={() => update({ accent: key })}
                                title={info.name}
                            >
                                <span className="stDot" style={{ background: info.value }} />
                                <span className="stLabel">{info.name}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="stCard">
                    <div className="stCardTitle">Language (语言)</div>
                    <div className="stRow">
                        <button
                            className={`stPill ${settings.language === "en" ? "isActive" : ""}`}
                            onClick={() => update({ language: "en" })}
                        >
                            English (EN)
                        </button>
                        <button
                            className={`stPill ${settings.language === "zh" ? "isActive" : ""}`}
                            onClick={() => update({ language: "zh" })}
                        >
                            中文 (ZH)
                        </button>
                    </div>
                    <div className="stHint">目前只是保存偏好；后面你可以接 i18n（internationalization）</div>
                </div>

                <div className="stCard">
                    <div className="stCardTitle">Layout Preference (布局)</div>
                    <div className="stRow">
                        <button
                            className={`stPill ${settings.layout === "split" ? "isActive" : ""}`}
                            onClick={() => update({ layout: "split" })}
                        >
                            Split View
                        </button>
                        <button
                            className={`stPill ${settings.layout === "focusRemote" ? "isActive" : ""}`}
                            onClick={() => update({ layout: "focusRemote" })}
                        >
                            Focus Remote
                        </button>
                        <button
                            className={`stPill ${settings.layout === "focusLocal" ? "isActive" : ""}`}
                            onClick={() => update({ layout: "focusLocal" })}
                        >
                            Focus Local
                        </button>
                    </div>
                    <div className="stHint">
                        你之后可以在 SearchPage 读取这个值，控制默认 scope / 默认分屏比例。
                    </div>
                </div>

                <div className="stCard">
                    <div className="stCardTitle">Danger Zone</div>
                    <div className="stRow">
                        <button
                            className="stDanger"
                            onClick={() => {
                                localStorage.removeItem(LS_KEY);
                                setSettings(DEFAULT_SETTINGS);
                                saveToast();
                            }}
                        >
                            Reset to Default
                        </button>
                    </div>
                    <div className="stHint">清空本地配置（localStorage）并恢复默认设置</div>
                </div>
            </main>
        </div>
    );
}
