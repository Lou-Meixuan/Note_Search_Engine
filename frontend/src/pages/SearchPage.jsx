/**
 * SearchPage.jsx - Main search interface
 * 
 * Split view with remote (Google) and local document search.
 * Includes theme toggle, upload modal, and document creation.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useColorTheme } from "../context/ColorThemeContext";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import { API } from "../config/api";
import UploadModal from "../components/UploadModal";
import CreateDocumentModal from "../components/CreateDocumentModal";
import "./SearchPage.css";

export default function SearchPage() {
    const [q, setQ] = useState("");
    const [scope, setScope] = useState("all"); // "remote" | "local" | "all"
    const [data, setData] = useState({ remote: [], local: [] });
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const { isDark, toggleMode } = useColorTheme();
    const { t } = useLanguage();
    const { user } = useAuth();

    // split view ratio: left panel width percentage
    const [leftPct, setLeftPct] = useState(52);
    const dragRef = useRef({ dragging: false, startX: 0, startPct: 52 });
    const containerRef = useRef(null);

    const [scopeOpen, setScopeOpen] = useState(false);
    const [uploadModalOpen, setUploadModalOpen] = useState(false);
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [newMenuOpen, setNewMenuOpen] = useState(false);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (newMenuOpen && !e.target.closest('.spNewBtnContainer')) {
                setNewMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [newMenuOpen]);

    useEffect(() => {
        // Load local documents
        fetchLocalDocuments();
        // Remote results empty by default
        setData((prev) => ({ ...prev, remote: [] }));
    }, [user]);

    async function fetchLocalDocuments() {
        // If not logged in, fetch documents from session storage (temp documents for this session)
        if (!user?.uid) {
            console.log('[Documents] Not logged in, loading session documents');
            const sessionDocIds = JSON.parse(sessionStorage.getItem('sessionDocIds') || '[]');
            
            if (sessionDocIds.length === 0) {
                setData((prev) => ({ ...prev, local: [] }));
                return;
            }

            // Fetch each document by ID
            try {
                const docs = await Promise.all(
                    sessionDocIds.map(async (docId) => {
                        try {
                            const res = await fetch(API.documentById(docId));
                            if (res.ok) return await res.json();
                            return null;
                        } catch {
                            return null;
                        }
                    })
                );

                const localDocs = docs
                    .filter(doc => doc && doc.source === 'local')
                    .map(doc => ({
                        id: doc.id,
                        name: doc.title,
                        type: 'file',
                        fileType: doc.fileType,
                        createdAt: doc.createdAt,
                        tags: doc.tags || [],
                    }));

                setData((prev) => ({ ...prev, local: localDocs }));
            } catch (e) {
                console.error('Failed to fetch session documents:', e);
                setData((prev) => ({ ...prev, local: [] }));
            }
            return;
        }

        try {
            // Logged in user: fetch only their documents
            const url = `${API.documents}?userId=${encodeURIComponent(user.uid)}`;
            const res = await fetch(url);
            if (res.ok) {
                const documents = await res.json();
                // Convert to local tile format
                const localDocs = documents
                    .filter(doc => doc.source === 'local')
                    .map(doc => ({
                        id: doc.id,
                        name: doc.title,
                        type: 'file',
                        fileType: doc.fileType,
                        createdAt: doc.createdAt,
                        tags: doc.tags || [],
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
    async function doSearch(nextScope = scope, customQuery = null) {
        setError("");
        const trimmed = (customQuery !== null ? customQuery : q).trim();

        // Empty query: reset to default state
        if (!trimmed) {
            fetchLocalDocuments();
            setData((prev) => ({ ...prev, remote: [] }));
            return;
        }

        try {
            const res = await fetch(
                `${API.search}?q=${encodeURIComponent(trimmed)}&scope=${encodeURIComponent(
                    nextScope
                )}`
            );

            if (!res.ok) {
                const text = await res.text().catch(() => "");
                throw new Error(`HTTP ${res.status} ${text || res.statusText}`);
            }

            const json = await res.json();
            console.log("[Search] Results:", json);

            // Backend response format: { results: [...], totalResults, query, scope }
            const searchResults = Array.isArray(json.results) ? json.results : [];

            // Convert search results to Local tile format
            const localResults = searchResults
                .filter(r => r.source === 'local')
                .map(r => ({
                    id: r.docId,
                    name: r.title,
                    type: 'file',
                    fileType: r.fileType,
                    score: r.score,
                    snippet: r.snippet,
                    tags: r.tags || [],
                }));

            // Remote search results
            const remoteResults = searchResults
                .filter(r => r.source === 'remote')
                .map(r => ({
                    title: r.title,
                    url: r.url || '#',
                    snippet: r.snippet,
                }));

            setData({
                remote: remoteResults,
                local: localResults.length ? localResults : [],
            });
        } catch (e) {
            console.error("[Search] Error:", e);
            setError(String(e?.message || e));
            setData((prev) => ({ remote: [], local: prev.local }));
        }
    }

    function onKeyDown(e) {
        if (e.key === "Enter") doSearch();
    }

    // Tag click handler
    function handleTagClick(tagName) {
        const tagQuery = `#${tagName}`;
        setQ(tagQuery);
        // Pass query directly to avoid state delay
        doSearch("local", tagQuery);
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

        // Clamp to reasonable range
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
        
        // For anonymous users, save document ID to session storage
        if (!user?.uid && uploadResult.documentId) {
            const sessionDocIds = JSON.parse(sessionStorage.getItem('sessionDocIds') || '[]');
            sessionDocIds.push(uploadResult.documentId);
            sessionStorage.setItem('sessionDocIds', JSON.stringify(sessionDocIds));
        }
        
        fetchLocalDocuments();
        navigate(`/document/${uploadResult.documentId}`);
    };

    const handleCreateSuccess = (createResult) => {
        console.log("Create successful:", createResult);
        
        // For anonymous users, save document ID to session storage
        if (!user?.uid && createResult.documentId) {
            const sessionDocIds = JSON.parse(sessionStorage.getItem('sessionDocIds') || '[]');
            sessionDocIds.push(createResult.documentId);
            sessionStorage.setItem('sessionDocIds', JSON.stringify(sessionDocIds));
        }
        
        fetchLocalDocuments();
        navigate(`/document/${createResult.documentId}`);
    };

    return (
        <div className="spPage">
            <UploadModal
                isOpen={uploadModalOpen}
                onClose={() => setUploadModalOpen(false)}
                onUploadSuccess={handleUploadSuccess}
            />
            <CreateDocumentModal
                isOpen={createModalOpen}
                onClose={() => setCreateModalOpen(false)}
                onCreateSuccess={handleCreateSuccess}
            />
            {/* Top Bar */}
            <header className="spTopbar">
                <div className="spLeft">
                    <Link className="spIconBtn" to="/home" aria-label="Home">
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
                        <span className="spThemeIcon">
                            {isDark ? '✹' : '⏾'}
                        </span>
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
                        {(data.remote || []).length > 0 ? (
                            (data.remote || []).map((r, idx) => (
                            <RemoteResultCard key={idx} item={r} />
                            ))
                        ) : (
                            <div className="spEmptyRemote">
                                {/* Google logo */}
                                <svg viewBox="0 0 272 92" className="spGoogleLogo">
                                    <path d="M115.75 47.18c0 12.77-9.99 22.18-22.25 22.18s-22.25-9.41-22.25-22.18C71.25 34.32 81.24 25 93.5 25s22.25 9.32 22.25 22.18zm-9.74 0c0-7.98-5.79-13.44-12.51-13.44S80.99 39.2 80.99 47.18c0 7.9 5.79 13.44 12.51 13.44s12.51-5.55 12.51-13.44z" fill="#EA4335"/>
                                    <path d="M163.75 47.18c0 12.77-9.99 22.18-22.25 22.18s-22.25-9.41-22.25-22.18c0-12.85 9.99-22.18 22.25-22.18s22.25 9.32 22.25 22.18zm-9.74 0c0-7.98-5.79-13.44-12.51-13.44s-12.51 5.46-12.51 13.44c0 7.9 5.79 13.44 12.51 13.44s12.51-5.55 12.51-13.44z" fill="#FBBC05"/>
                                    <path d="M209.75 26.34v39.82c0 16.38-9.66 23.07-21.08 23.07-10.75 0-17.22-7.19-19.66-13.07l8.48-3.53c1.51 3.61 5.21 7.87 11.17 7.87 7.31 0 11.84-4.51 11.84-13v-3.19h-.34c-2.18 2.69-6.38 5.04-11.68 5.04-11.09 0-21.25-9.66-21.25-22.09 0-12.52 10.16-22.26 21.25-22.26 5.29 0 9.49 2.35 11.68 4.96h.34v-3.61h9.25zm-8.56 20.92c0-7.81-5.21-13.52-11.84-13.52-6.72 0-12.35 5.71-12.35 13.52 0 7.73 5.63 13.36 12.35 13.36 6.63 0 11.84-5.63 11.84-13.36z" fill="#4285F4"/>
                                    <path d="M225 3v65h-9.5V3h9.5z" fill="#34A853"/>
                                    <path d="M262.02 54.48l7.56 5.04c-2.44 3.61-8.32 9.83-18.48 9.83-12.6 0-22.01-9.74-22.01-22.18 0-13.19 9.49-22.18 20.92-22.18 11.51 0 17.14 9.16 18.98 14.11l1.01 2.52-29.65 12.28c2.27 4.45 5.8 6.72 10.75 6.72 4.96 0 8.4-2.44 10.92-6.14zm-23.27-7.98l19.82-8.23c-1.09-2.77-4.37-4.7-8.23-4.7-4.95 0-11.84 4.37-11.59 12.93z" fill="#EA4335"/>
                                    <path d="M35.29 41.41V32H67c.31 1.64.47 3.58.47 5.68 0 7.06-1.93 15.79-8.15 22.01-6.05 6.3-13.78 9.66-24.02 9.66C16.32 69.35.36 53.89.36 34.91.36 15.93 16.32.47 35.3.47c10.5 0 17.98 4.12 23.6 9.49l-6.64 6.64c-4.03-3.78-9.49-6.72-16.97-6.72-13.86 0-24.7 11.17-24.7 25.03 0 13.86 10.84 25.03 24.7 25.03 8.99 0 14.11-3.61 17.39-6.89 2.66-2.66 4.41-6.46 5.1-11.65l-22.49.01z" fill="#4285F4"/>
                                </svg>
                                <p className="spEmptyHint">{t("searchToSeeResults") || "Search to see Google results"}</p>
                            </div>
                        )}
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
                        <div className="spNewBtnContainer">
                        <button
                            className="spAddBtn"
                                onClick={() => setNewMenuOpen(!newMenuOpen)}
                                aria-label="New Document"
                                title="New Document"
                        >
                            + New
                        </button>
                            {newMenuOpen && (
                                <div className="spNewMenu">
                                    <button
                                        className="spNewMenuItem"
                                        onClick={() => {
                                            setNewMenuOpen(false);
                                            setCreateModalOpen(true);
                                        }}
                                    >
                                        <svg viewBox="0 0 24 24" className="spNewMenuIcon">
                                            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm4 18H6V4h7v5h5v11z" fill="currentColor"/>
                                            <path d="M13 13h-2v-2H9v2H7v2h2v2h2v-2h2v-2z" fill="currentColor"/>
                                        </svg>
                                        Create New
                                    </button>
                                    <button
                                        className="spNewMenuItem"
                                        onClick={() => {
                                            setNewMenuOpen(false);
                                            setUploadModalOpen(true);
                                        }}
                                    >
                                        <svg viewBox="0 0 24 24" className="spNewMenuIcon">
                                            <path d="M9 16h6v-6h4l-7-7-7 7h4v6zm-4 2h14v2H5v-2z" fill="currentColor"/>
                                        </svg>
                                        Upload File
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="spGrid">
                        {(data.local || []).map((f, idx) => (
                            <LocalTile key={idx} item={f} onTagClick={handleTagClick} />
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

function LocalTile({ item, onTagClick }) {
    const isFolder = item.type === "folder";
    const navigate = useNavigate();

    const handleClick = () => {
        if (!isFolder && item.id) {
            navigate(`/document/${item.id}`);
        }
    };

    const handleTagClick = (e, tagName) => {
        e.stopPropagation();
        if (onTagClick) {
            onTagClick(tagName);
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
            {/* Tags */}
            {item.tags && item.tags.length > 0 && (
                <div className="spTileTags">
                    {item.tags.slice(0, 3).map((tag, idx) => (
                        <span 
                            key={idx} 
                            className="spTag"
                            onClick={(e) => handleTagClick(e, tag)}
                            title={`Search #${tag}`}
                        >
                            #{tag}
                        </span>
                    ))}
                    {item.tags.length > 3 && (
                        <span className="spTagMore">+{item.tags.length - 3}</span>
                    )}
                </div>
            )}
        </div>
    );
}
