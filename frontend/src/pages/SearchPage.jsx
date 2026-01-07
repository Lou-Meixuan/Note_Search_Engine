/**
 * SearchPage.jsx - 搜索页面主组件
 * 
 * Modified by: C
 * Date: 2026-01-07
 * 
 * 修改记录:
 * - C: 修改 doSearch 函数，正确处理后端返回的搜索结果格式
 *      - 后端返回: { results: [...], totalResults, query, scope }
 *      - 将 local 搜索结果按分数排序并显示百分比
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
                            placeholder="Search your notes..."
                        />

                        {/* scope dropdown */}
                        <div className="spScope">
                            <button
                                className="spScopeBtn"
                                onClick={() => setScopeOpen((v) => !v)}
                                aria-label="Scope"
                            >
                                <svg viewBox="0 0 24 24" className="spIcon">
                                    <path d="M7 10l5 5 5-5H7z" />
                                </svg>
                            </button>

                            {scopeOpen && (
                                <div className="spScopeMenu" role="menu">
                                    <ScopeItem
                                        active={scope === "remote"}
                                        label="找全网 (remote)"
                                        onClick={() => {
                                            setScope("remote");
                                            setScopeOpen(false);
                                            doSearch("remote");
                                        }}
                                    />
                                    <ScopeItem
                                        active={scope === "local"}
                                        label="找本地 (local)"
                                        onClick={() => {
                                            setScope("local");
                                            setScopeOpen(false);
                                            doSearch("local");
                                        }}
                                    />
                                    <ScopeItem
                                        active={scope === "all"}
                                        label="找全部 (all)"
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
                    <Link className="spIconBtn" to="/settings" aria-label="Settings">
                        {/* gear */}
                        <svg viewBox="0 0 24 24" className="spIcon">
                            <path d="M19.14 12.94a7.43 7.43 0 000-1.88l2.03-1.58-1.92-3.32-2.39.96a7.27 7.27 0 00-1.63-.95l-.36-2.54H9.13l-.36 2.54c-.57.22-1.12.54-1.63.95l-2.39-.96-1.92 3.32 2.03 1.58a7.43 7.43 0 000 1.88L2.83 14.52l1.92 3.32 2.39-.96c.51.41 1.06.73 1.63.95l.36 2.54h5.74l.36-2.54c.57-.22 1.12-.54 1.63-.95l2.39.96 1.92-3.32-2.03-1.58zM12 15.5A3.5 3.5 0 1112 8a3.5 3.5 0 010 7.5z" />
                        </svg>
                    </Link>

                    <Link className="spIconBtn" to="/account" aria-label="Account">
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
                            <span className="spPanelTitle">Remote</span>
                            <span className="spPanelHint">搜索引擎 (search engine) 结果</span>
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
                            <span className="spPanelTitle">Local</span>
                            <span className="spPanelHint">本地文档 (local documents)</span>
                        </div>
                        <button
                            className="spAddBtn"
                            onClick={() => setUploadModalOpen(true)}
                            aria-label="Upload document"
                            title="Upload document"
                        >
                            + New
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
