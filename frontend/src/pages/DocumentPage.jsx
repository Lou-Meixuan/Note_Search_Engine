import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./DocumentPage.css";

export default function DocumentPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [document, setDocument] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [deleting, setDeleting] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    useEffect(() => {
        fetchDocument();
    }, [id]);

    const fetchDocument = async () => {
        setLoading(true);
        setError("");

        try {
            const response = await fetch(`http://localhost:3001/documents/${id}`);

            if (!response.ok) {
                throw new Error("Document not found");
            }

            const data = await response.json();
            setDocument(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteClick = () => {
        setShowDeleteModal(true);
    };

    const handleDeleteConfirm = async () => {
        setDeleting(true);
        setError("");
        setShowDeleteModal(false);

        try {
            const response = await fetch(`http://localhost:3001/documents/${id}`, {
                method: "DELETE",
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Delete failed");
            }

            navigate("/");
        } catch (err) {
            setError(err.message);
            setDeleting(false);
        }
    };

    const handleDeleteCancel = () => {
        setShowDeleteModal(false);
    };

    if (loading) {
        return (
            <div className="documentPage">
                <div className="loadingSpinner">Loading...</div>
            </div>
        );
    }

    if (error && !document) {
        return (
            <div className="documentPage">
                <div className="errorBox">{error}</div>
                <button className="backButton" onClick={() => navigate("/")}>
                    Back to Home
                </button>
            </div>
        );
    }

    return (
        <div className="documentPage">
            {/* Top toolbar */}
            <div className="documentToolbar">
                <button className="backButton" onClick={() => navigate("/")}>
                    <svg viewBox="0 0 24 24" className="btnIcon">
                        <path d="M15 18l-6-6 6-6" fill="none" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                    Back
                </button>
                <button
                    className="deleteButton"
                    onClick={handleDeleteClick}
                    disabled={deleting}
                >
                    <svg viewBox="0 0 24 24" className="btnIcon">
                        <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" fill="currentColor"/>
                    </svg>
                    {deleting ? "Deleting..." : "Delete"}
                </button>
            </div>

            {/* Delete confirmation modal */}
            {showDeleteModal && (
                <div className="modalOverlay" onClick={handleDeleteCancel}>
                    <div className="deleteModal" onClick={(e) => e.stopPropagation()}>
                        <h2 className="deleteModalTitle">Delete Document</h2>
                        <p className="deleteModalText">
                            Are you sure you want to delete "{document.title}"?
                        </p>
                        <div className="deleteModalActions">
                            <button className="modalCancelBtn" onClick={handleDeleteCancel}>
                                Cancel
                            </button>
                            <button className="modalDeleteBtn" onClick={handleDeleteConfirm}>
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {error && <div className="errorMessage">{error}</div>}

            {/* Document content area */}
            <div className="documentContentArea">
                {/* Document title */}
                <h1 className="documentTitle">{document.title}</h1>

                {/* Metadata bar */}
                <div className="documentMeta">
                    <span className="metaItem">{document.fileType.toUpperCase()}</span>
                    <span className="metaSeparator">•</span>
                    <span className="metaItem">
                        {new Date(document.createdAt).toLocaleDateString()}
                    </span>
                    {document.tags && document.tags.length > 0 && (
                        <>
                            <span className="metaSeparator">•</span>
                            {document.tags.map((tag, idx) => (
                                <span key={idx} className="tag">
                                    {tag}
                                </span>
                            ))}
                        </>
                    )}
                </div>

                {/* Content */}
                <div className="documentBody">
                    {document.fileType === 'pdf' ? (
                        <iframe
                            src={`http://localhost:3001/documents/${id}/file`}
                            className="pdfViewer"
                            title={document.title}
                        />
                    ) : (
                        <div className="textContent">{document.content}</div>
                    )}
                </div>
            </div>
        </div>
    );
}
