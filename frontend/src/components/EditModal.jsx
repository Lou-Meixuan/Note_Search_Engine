/**
 * EditModal.jsx - Document edit modal
 */

import { useState, useEffect } from "react";
import { useLanguage } from "../context/LanguageContext";
import { API } from "../config/api";
import "./EditModal.css";
import "./ModalButtons.css";

export default function EditModal({ isOpen, onClose, document, onEditSuccess }) {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [tags, setTags] = useState("");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const { t } = useLanguage();

    useEffect(() => {
        if (document) {
            setTitle(document.title || "");
            setContent(document.content || "");
            setTags(document.tags ? document.tags.join(", ") : "");
        }
    }, [document]);

    if (!isOpen) return null;

    const handleSave = async (e) => {
        e.preventDefault();

        if (!title.trim()) {
            setError("Title cannot be empty");
            return;
        }

        if (!content.trim()) {
            setError("Content cannot be empty");
            return;
        }

        setSaving(true);
        setError("");

        try {
            const tagsArray = tags
                .split(",")
                .map(tag => tag.trim())
                .filter(tag => tag.length > 0);

            const response = await fetch(API.documentById(document.id), {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    title: title.trim(),
                    content: content.trim(),
                    tags: tagsArray,
                }),
            });

            if (!response.ok) {
                const data = await response.json().catch(() => ({ error: "Server error" }));
                throw new Error(data.error || `Update failed: ${response.status}`);
            }

            const data = await response.json();
            console.log("Update successful:", data);

            if (onEditSuccess) {
                onEditSuccess(data);
            }

            onClose();

        } catch (err) {
            console.error("Update error:", err);
            if (err.message === "Failed to fetch") {
                setError("Cannot connect to server. Please check your connection.");
            } else {
                setError(err.message);
            }
        } finally {
            setSaving(false);
        }
    };

    const handleClose = () => {
        if (!saving) {
            setError("");
            onClose();
        }
    };

    return (
        <div className="modalOverlay" onClick={handleClose}>
            <div className="editModalContent" onClick={(e) => e.stopPropagation()}>
                <div className="modalHeader">
                    <h2>Edit Document</h2>
                    <button
                        className="modalCloseBtn"
                        onClick={handleClose}
                        disabled={saving}
                        aria-label="Close"
                    >
                        ×
                    </button>
                </div>

                <form onSubmit={handleSave} className="editForm">
                    <div className="formField">
                        <label htmlFor="editTitleInput">Title</label>
                        <input
                            id="editTitleInput"
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Enter document title"
                            disabled={saving}
                            required
                        />
                    </div>

                    <div className="formField">
                        <label htmlFor="editContentInput">Content</label>
                        <textarea
                            id="editContentInput"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Enter document content"
                            disabled={saving}
                            rows={15}
                            required
                        />
                    </div>

                    <div className="formField">
                        <label htmlFor="editTagsInput">Tags</label>
                        <input
                            id="editTagsInput"
                            type="text"
                            value={tags}
                            onChange={(e) => setTags(e.target.value)}
                            placeholder="e.g. work, important, draft"
                            disabled={saving}
                        />
                    </div>

                    {error && <div className="modalError">{error}</div>}

                    <div className="modalButtonGroup">
                        <button
                            type="button"
                            className="modalBtn modalBtn--cancel"
                            onClick={handleClose}
                            disabled={saving}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="modalBtn modalBtn--primary"
                            disabled={saving}
                        >
                            {saving ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
