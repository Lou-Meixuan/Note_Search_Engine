/**
 * DocumentPage.jsx - Document detail view
 * 
 * Displays document content with edit and delete options.
 */

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { marked } from "marked";
import { API } from "../config/api";
import EditModal from "../components/EditModal";
import "./DocumentPage.css";

export default function DocumentPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [document, setDocument] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [deleting, setDeleting] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [isPreviewMode, setIsPreviewMode] = useState(true); // Default to preview mode

    useEffect(() => {
        fetchDocument();
    }, [id]);

    const fetchDocument = async () => {
        setLoading(true);
        setError("");

        try {
            const response = await fetch(API.documentById(id));

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
            const response = await fetch(API.documentById(id), {
                method: "DELETE",
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Delete failed");
            }

            navigate("/home");
        } catch (err) {
            setError(err.message);
            setDeleting(false);
        }
    };

    const handleDeleteCancel = () => {
        setShowDeleteModal(false);
    };

    const handleEditClick = () => {
        setShowEditModal(true);
    };

    const handleEditSuccess = async () => {
        await fetchDocument();
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
                <div className="toolbarActions">
                    {document.fileType === 'md' && (
                        <button
                            className="previewButton"
                            onClick={() => setIsPreviewMode(!isPreviewMode)}
                        >
                            <svg viewBox="0 0 24 24" className="btnIcon">
                                {isPreviewMode ? (
                                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm4 18H6V4h7v5h5v11z" fill="currentColor"/>
                                ) : (
                                    <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" fill="currentColor"/>
                                )}
                            </svg>
                            {isPreviewMode ? "Raw" : "Preview"}
                        </button>
                    )}
                    {document.fileType !== 'pdf' && (
                        <button
                            className="editButton"
                            onClick={handleEditClick}
                        >
                            <svg viewBox="0 0 24 24" className="btnIcon">
                                <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill="currentColor"/>
                            </svg>
                            Edit
                        </button>
                    )}
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
            </div>

            {/* Edit Modal */}
            <EditModal
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                document={document}
                onEditSuccess={handleEditSuccess}
            />

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
                            src={API.documentFile(id)}
                            className="pdfViewer"
                            title={document.title}
                        />
                    ) : document.fileType === 'md' && isPreviewMode ? (
                        <div
                            className="markdownPreview"
                            dangerouslySetInnerHTML={{ __html: marked(document.content) }}
                        />
                    ) : (
                        <div className="textContent">{document.content}</div>
                    )}
                </div>
            </div>
        </div>
    );
}
