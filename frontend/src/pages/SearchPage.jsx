/**
 * SearchPage.jsx - 搜索页面主组件
 * 
 * Modified by: C (Cheng)
 * Date: 2026-01-07
 * 
 * 修改记录:
 * - C: 修改 doSearch 函数，正确处理后端返回的搜索结果格式
 * - C: 添加 Dark Mode 切换按钮
 * - C: 添加多语言支持
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useColorTheme } from "../context/ColorThemeContext";
import { useLanguage } from "../context/LanguageContext";
import UploadModal from "../components/UploadModal";
import "./SearchPage.css";

/**
 * SearchPage UI
 * - Top bar: Home + Search bar + Scope dropdown + icons (search/settings/account)
 * - Body: split view (remote results / local grid), draggable divider
 * - Data: fetch from backend (optional), but UI works even with mock data
 */
export default function SearchPage() {
    const [q, setQ] = useState("");
    const [scope, setScope] = useState("all"); // "remote" | "local" | "all"
    const [data, setData] = useState({ remote: [], local: [] });
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const { isDark, toggleMode } = useColorTheme();
    const { t } = useLanguage();

    // split view ratio: left panel width percentage
    const [leftPct, setLeftPct] = useState(52);
    const dragRef = useRef({ dragging: false, startX: 0, startPct: 52 });
    const containerRef = useRef(null);

    const [scopeOpen, setScopeOpen] = useState(false);
    const [uploadModalOpen, setUploadModalOpen] = useState(false);

    // ---- mock data (UI first) ----
    const mockRemote = useMemo(
        () => [
            {
                title: "Sublime Text - Text Editing, Done Right",
                url: "https://www.sublimetext.com",
                snippet:
                    "Sublime Text is a sophisticated text editor for code, markup and prose. You'll love the slick user interface...",
            },
            {
                title: "Text | Apple Developer Documentation",
                url: "https://developer.apple.com/documentation/",
                snippet:
                    "A text view displays a string in your app’s user interface using a body font that’s appropriate for the current platform...",
            },
            {
                title: "TEXT Definition & Meaning - Merriam-Webster",
                url: "https://www.merriam-webster.com/dictionary/text",
                snippet:
                    "Definition of text: the original words and form of a written or printed work; an edited or printed copy...",
            },
        ],
        []
    );

    useEffect(() => {
        // 加载本地文档
        fetchLocalDocuments();
        // default: show mock for remote
        setData((prev) => ({ ...prev, remote: mockRemote }));
    }, [mockRemote]);

    async function fetchLocalDocuments() {
        try {
            const res = await fetch('http://localhost:3001/documents');
            if (res.ok) {
                const documents = await res.json();
                // 转换成 local tile 格式
                const localDocs = documents
                    .filter(doc => doc.source === 'local')
                    .map(doc => ({
                        id: doc.id,
                        name: doc.title,
                        type: 'file',
                        fileType: doc.fileType,
                        createdAt: doc.createdAt
                    }));

                setData((prev) => ({
                    ...prev,
                    local: localDocs
                }));
            }
        } catch (e) {
            console.error('Failed to fetch local documents:', e);
            setData((prev) => ({ ...prev, local: [] }));
        }
    }

    // ---- fetch search ----
    async function doSearch(nextScope = scope) {
        setError("");
        const trimmed = q.trim();

        // 空 query: 重置为默认状态
        if (!trimmed) {
            fetchLocalDocuments();
            setData((prev) => ({ ...prev, remote: mockRemote }));
            return;
        }

        try {
            const res = await fetch(
                `http://localhost:3001/search?q=${encodeURIComponent(trimmed)}&scope=${encodeURIComponent(
                    nextScope
                )}`
            );

            if (!res.ok) {
                const text = await res.text().catch(() => "");
                throw new Error(`HTTP ${res.status} ${text || res.statusText}`);
            }

            const json = await res.json();
            console.log("[Search] Results:", json);

            // 后端返回格式: { results: [...], totalResults, query, scope }
            const searchResults = Array.isArray(json.results) ? json.results : [];

            // 转换搜索结果为 Local tile 格式，并按分数排序
            const localResults = searchResults
                .filter(r => r.source === 'local')
                .map(r => ({
                    id: r.docId,
                    name: `${r.title} (${(r.score * 100).toFixed(0)}%)`,
                    type: 'file',
                    fileType: r.fileType,
                    score: r.score,
                    snippet: r.snippet,
                }));

            // Remote 搜索结果
            const remoteResults = searchResults
                .filter(r => r.source === 'remote')
                .map(r => ({
                    title: r.title,
                    url: r.url || '#',
                    snippet: r.snippet,
                }));

            setData({
                remote: remoteResults.length ? remoteResults : mockRemote,
                local: localResults.length ? localResults : [],
            });
        } catch (e) {
            console.error("[Search] Error:", e);
            setError(String(e?.message || e));
            setData((prev) => ({ remote: mockRemote, local: prev.local }));
        }
    }

    function onKeyDown(e) {
        if (e.key === "Enter") doSearch();
    }

    // ---- split drag handlers ----
    function onDragStart(e) {
        dragRef.current.dragging = true;
        dragRef.current.startX = e.clientX;
        dragRef.current.startPct = leftPct;
        document.body.classList.add("noSelect");
    }

    function onDragMove(e) {
        if (!dragRef.current.dragging) return;
        const el = containerRef.current;
        if (!el) return;

        const rect = el.getBoundingClientRect();
        const dx = e.clientX - dragRef.current.startX;
        const pctDelta = (dx / rect.width) * 100;
        let next = dragRef.current.startPct + pctDelta;

        // clamp：别拖到太极端
        next = Math.max(28, Math.min(72, next));
        setLeftPct(next);
    }

    function onDragEnd() {
        if (!dragRef.current.dragging) return;
        dragRef.current.dragging = false;
        document.body.classList.remove("noSelect");
    }

    useEffect(() => {
        window.addEventListener("mousemove", onDragMove);
        window.addEventListener("mouseup", onDragEnd);
        return () => {
            window.removeEventListener("mousemove", onDragMove);
            window.removeEventListener("mouseup", onDragEnd);
        };
    }, [leftPct]);

    // ---- helpers ----
    const showRemote = scope === "remote" || scope === "all";
    const showLocal = scope === "local" || scope === "all";

    const handleUploadSuccess = (uploadResult) => {
        console.log("Upload successful:", uploadResult);
        fetchLocalDocuments();
        navigate(`/document/${uploadResult.documentId}`);
    };

    return (
        <div className="spPage">
            <UploadModal
                isOpen={uploadModalOpen}
                onClose={() => setUploadModalOpen(false)}
                onUploadSuccess={handleUploadSuccess}
            />
            {/* Top Bar */}
            <header className="spTopbar">
                <div className="spLeft">
                    <Link className="spIconBtn" to="/" aria-label="Home">
                        {/* home icon */}
                        <svg viewBox="0 0 24 24" className="spIcon">
                            <path d="M12 3l9 8h-3v10h-5v-6H11v6H6V11H3l9-8z" />
                        </svg>
                    </Link>
                </div>

                <div className="spCenter">
                    <div className="spSearchWrap">
                        <input
                            className="spSearchInput"
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                            onKeyDown={onKeyDown}
                            placeholder={t("searchPlaceholder")}
                        />

                        {/* scope dropdown */}
                        <div className="spScope">
                            <button
                                className="spScopeBtn"
                                onClick={() => setScopeOpen((v) => !v)}
                                aria-label="Scope"
                            >
                                {/* Scope icon based on current selection */}
                                {scope === "remote" && (
                                    <svg viewBox="0 0 24 24" className="spScopeIcon">
                                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
                                    </svg>
                                )}
                                {scope === "local" && (
                                    <svg viewBox="0 0 24 24" className="spScopeIcon">
                                        <path d="M20 6h-8l-2-2H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 12H4V8h16v10z" />
                                    </svg>
                                )}
                                {scope === "all" && (
                                    <svg viewBox="0 0 24 24" className="spScopeIcon">
                                        <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
                                    </svg>
                                )}
                                {/* Dropdown arrow */}
                                <svg viewBox="0 0 24 24" className="spScopeArrow">
                                    <path d="M7 10l5 5 5-5H7z" />
                                </svg>
                            </button>

                            {scopeOpen && (
                                <div className="spScopeMenu" role="menu">
                                    <ScopeItem
                                        active={scope === "remote"}
                                        label={t("scopeRemote")}
                                        onClick={() => {
                                            setScope("remote");
                                            setScopeOpen(false);
                                            doSearch("remote");
                                        }}
                                    />
                                    <ScopeItem
                                        active={scope === "local"}
                                        label={t("scopeLocal")}
                                        onClick={() => {
                                            setScope("local");
                                            setScopeOpen(false);
                                            doSearch("local");
                                        }}
                                    />
                                    <ScopeItem
                                        active={scope === "all"}
                                        label={t("scopeAll")}
                                        onClick={() => {
                                            setScope("all");
                                            setScopeOpen(false);
                                            doSearch("all");
                                        }}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="spRight">
                    {/* Theme Toggle Button */}
                    <button
                        className="spIconBtn spThemeBtn"
                        onClick={toggleMode}
                        aria-label={isDark ? t("switchToLight") : t("switchToDark")}
                        title={isDark ? t("lightMode") : t("darkMode")}
                    >
                        {isDark ? (
                            // Sun icon (solid, centered)
                            <svg viewBox="0 0 24 24" className="spIcon" aria-hidden="true">
                                <path d="M12 18a6 6 0 116-6 6 6 0 01-6 6zm0-10a4 4 0 104 4 4 4 0 00-4-4zM11 2h2v3h-2zm0 17h2v3h-2zM2 11h3v2H2zm17 0h3v2h-3zM4.22 5.64l1.42-1.42 2.12 2.12-1.42 1.42zM16.24 17.66l1.42-1.42 2.12 2.12-1.42 1.42zM18.36 4.22l1.42 1.42-2.12 2.12-1.42-1.42zM6.34 16.24l1.42 1.42-2.12 2.12-1.42-1.42z" />
                            </svg>
                        ) : (
                            // Moon icon (clean crescent, centered)
                            <svg viewBox="0 0 24 24" className="spIcon" aria-hidden="true">
                                <path d="M21 12.79A9 9 0 1111.21 3a7 7 0 009.79 9.79z" />                            </svg>
                        )}
                    </button>

                    <Link className="spIconBtn" to="/settings" aria-label={t("settings")}>
                        {/* gear */}
                        <svg viewBox="0 0 24 24" className="spIcon">
                            <path d="M19.14 12.94a7.43 7.43 0 000-1.88l2.03-1.58-1.92-3.32-2.39.96a7.27 7.27 0 00-1.63-.95l-.36-2.54H9.13l-.36 2.54c-.57.22-1.12.54-1.63.95l-2.39-.96-1.92 3.32 2.03 1.58a7.43 7.43 0 000 1.88L2.83 14.52l1.92 3.32 2.39-.96c.51.41 1.06.73 1.63.95l.36 2.54h5.74l.36-2.54c.57-.22 1.12-.54 1.63-.95l2.39.96 1.92-3.32-2.03-1.58zM12 15.5A3.5 3.5 0 1112 8a3.5 3.5 0 010 7.5z" />
                        </svg>
                    </Link>

                    <Link className="spIconBtn" to="/account" aria-label={t("account")}>
                        {/* user */}
                        <svg viewBox="0 0 24 24" className="spIcon">
                            <path d="M12 12a4 4 0 10-4-4 4 4 0 004 4zm0 2c-4.42 0-8 2.24-8 5v1h16v-1c0-2.76-3.58-5-8-5z" />
                        </svg>
                    </Link>
                </div>
            </header>

            {error ? <div className="spError">{error}</div> : null}

            {/* Split Body */}
            <main className="spBody" ref={containerRef}>
                {/* Left: remote */}
                <section
                    className={`spPanel ${!showRemote ? "spHidden" : ""}`}
                    style={{ width: showRemote && showLocal ? `${leftPct}%` : "100%" }}
                >
                    <div className="spPanelHeader">
                        <div className="spPanelHeaderLeft">
                            <span className="spPanelTitle">{t("remote")}</span>
                            <span className="spPanelHint">{t("remoteHint")}</span>
                        </div>
                    </div>

                    <div className="spResults">
                        {(data.remote || []).map((r, idx) => (
                            <RemoteResultCard key={idx} item={r} />
                        ))}
                    </div>
                </section>

                {/* Divider */}
                {showRemote && showLocal ? (
                    <div className="spDivider" onMouseDown={onDragStart} role="separator" aria-label="Resize">
                        <div className="spDividerHandle" />
                    </div>
                ) : null}

                {/* Right: local */}
                <section
                    className={`spPanel ${!showLocal ? "spHidden" : ""}`}
                    style={{ width: showRemote && showLocal ? `${100 - leftPct}%` : "100%" }}
                >
                    <div className="spPanelHeader">
                        <div className="spPanelHeaderLeft">
                            <span className="spPanelTitle">{t("local")}</span>
                            <span className="spPanelHint">{t("localHint")}</span>
                        </div>
                        <button
                            className="spAddBtn"
                            onClick={() => setUploadModalOpen(true)}
                            aria-label={t("upload")}
                            title={t("upload")}
                        >
                            {t("newDocument")}
                        </button>
                    </div>

                    <div className="spGrid">
                        {(data.local || []).map((f, idx) => (
                            <LocalTile key={idx} item={f} />
                        ))}
                    </div>
                </section>
            </main>
        </div>
    );
}

function ScopeItem({ active, label, onClick }) {
    return (
        <button className={`spScopeItem ${active ? "isActive" : ""}`} onClick={onClick} role="menuitem">
            {label}
            {active ? <span className="spCheck">✓</span> : null}
        </button>
    );
}

function RemoteResultCard({ item }) {
    return (
        <a className="spResultCard" href={item.url || "#"} target="_blank" rel="noreferrer">
            <div className="spResultTop">
                <div className="spFavicon" aria-hidden />
                <div className="spResultMeta">
                    <div className="spResultTitle">{item.title || "Untitled"}</div>
                    <div className="spResultUrl">{item.url || ""}</div>
                </div>
            </div>
            <div className="spResultSnippet">{item.snippet || ""}</div>
        </a>
    );
}

function LocalTile({ item }) {
    const isFolder = item.type === "folder";
    const navigate = useNavigate();

    const handleClick = () => {
        if (!isFolder && item.id) {
            navigate(`/document/${item.id}`);
        }
    };

    return (
        <div
            className={`spTile ${!isFolder && item.id ? "spClickable" : ""}`}
            title={item.name}
            onClick={handleClick}
        >
            <div className={`spTileIcon ${isFolder ? "isFolder" : "isFile"}`}>
                {isFolder ? (
                    <svg viewBox="0 0 24 24" className="spIcon">
                        <path d="M10 4l2 2h8a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2h6z" />
                    </svg>
                ) : (
                    <svg viewBox="0 0 24 24" className="spIcon">
                        <path d="M6 2h9l3 3v17a2 2 0 01-2 2H6a2 2 0 01-2-2V4a2 2 0 012-2zm8 1v4h4" />
                    </svg>
                )}
            </div>
            <div className="spTileName">{item.name}</div>
        </div>
    );
}
