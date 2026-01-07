/**
 * AccountPage.jsx - 账户页面
 * 
 * Modified by: C (Cheng)
 * Date: 2026-01-07
 * 
 * 修改记录:
 * - C: 添加多语言支持
 */

import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useLanguage } from "../context/LanguageContext";
import "./AccountPage.css";

const LS_KEY = "nse_account_v1";

export default function AccountPage() {
    const [user, setUser] = useState(null);
    const { t } = useLanguage();

    // load (fake session)
    useEffect(() => {
        try {
            const raw = localStorage.getItem(LS_KEY);
            if (!raw) return;
            setUser(JSON.parse(raw));
        } catch {
            // ignore
        }
    }, []);

    function signInMock() {
        const fake = {
            name: "Hikono",
            email: "hikono@example.com",
            plan: "Free",
            createdAt: new Date().toISOString(),
        };
        setUser(fake);
        localStorage.setItem(LS_KEY, JSON.stringify(fake));
    }

    function signOut() {
        setUser(null);
        localStorage.removeItem(LS_KEY);
    }

    return (
        <div className="acPage">
            <header className="acTopbar">
                <div className="acLeft">
                    <Link className="acIconBtn" to="/" aria-label={t("home")}>
                        <svg viewBox="0 0 24 24" className="acIcon">
                            <path d="M12 3l9 8h-3v10h-5v-6H11v6H6V11H3l9-8z" />
                        </svg>
                    </Link>
                </div>

                <div className="acCenter">
                    <div className="acTitle">{t("accountTitle")}</div>
                </div>

                <div className="acRight">
                    <Link className="acIconBtn" to="/" aria-label={t("search")}>
                        <svg viewBox="0 0 24 24" className="acIcon">
                            <path d="M10 4a6 6 0 104.472 10.03l4.249 4.248 1.414-1.414-4.248-4.249A6 6 0 0010 4zm0 2a4 4 0 110 8 4 4 0 010-8z" />
                        </svg>
                    </Link>
                    <Link className="acIconBtn" to="/settings" aria-label={t("settings")}>
                        <svg viewBox="0 0 24 24" className="acIcon">
                            <path d="M19.14 12.94a7.43 7.43 0 000-1.88l2.03-1.58-1.92-3.32-2.39.96a7.27 7.27 0 00-1.63-.95l-.36-2.54H9.13l-.36 2.54c-.57.22-1.12.54-1.63.95l-2.39-.96-1.92 3.32 2.03 1.58a7.43 7.43 0 000 1.88L2.83 14.52l1.92 3.32 2.39-.96c.51.41 1.06.73 1.63.95l.36 2.54h5.74l.36-2.54c.57-.22 1.12-.54 1.63-.95l2.39.96 1.92-3.32-2.03-1.58zM12 15.5A3.5 3.5 0 1112 8a3.5 3.5 0 010 7.5z" />
                        </svg>
                    </Link>
                </div>
            </header>

            <main className="acBody">
                <div className="acCard">
                    <div className="acAvatar">
                        <svg viewBox="0 0 24 24" className="acAvatarIcon">
                            <path d="M12 12a4 4 0 10-4-4 4 4 0 004 4zm0 2c-4.42 0-8 2.24-8 5v1h16v-1c0-2.76-3.58-5-8-5z" />
                        </svg>
                    </div>

                    {user ? (
                        <>
                            <div className="acName">{user.name}</div>
                            <div className="acMeta">{user.email}</div>

                            <div className="acGrid">
                                <Info label="Plan" value={user.plan} />
                                <Info label="Member since" value={formatDate(user.createdAt)} />
                                <Info label="Storage" value="Local (browser)" />
                                <Info label="Sync" value="Not connected" />
                            </div>

                            <div className="acRow">
                                <button className="acBtn" onClick={signOut}>
                                    {t("logout")}
                                </button>
                                <Link className="acBtn ghost" to="/settings">
                                    {t("settings")}
                                </Link>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="acName">Not signed in</div>
                            <div className="acMeta">Sign in to persist your documents across devices.</div>

                            <div className="acRow">
                                <button className="acBtn" onClick={signInMock}>
                                    Sign in (mock)
                                </button>
                                <Link className="acBtn ghost" to="/settings">
                                    {t("settings")}
                                </Link>
                            </div>
                        </>
                    )}
                </div>
            </main>
        </div>
    );
}

function Info({ label, value }) {
    return (
        <div className="acInfo">
            <div className="acInfoLabel">{label}</div>
            <div className="acInfoValue">{value}</div>
        </div>
    );
}

function formatDate(iso) {
    try {
        const d = new Date(iso);
        return d.toLocaleDateString();
    } catch {
        return iso;
    }
}
