import { useState, useRef, useCallback, useEffect } from "react";
import { marked } from "marked";
import GrammarPanel from "./GrammarPanel";
import { checkGrammar, createNote, updateNote } from "../services/api";
import "./Editor.css";

// Configure marked once
marked.setOptions({ gfm: true, breaks: true });

export default function Editor({ selectedNote, onSaved, onCancel }) {
  const [tab, setTab] = useState("write"); // "write" | "preview"
  const [title, setTitle]     = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags]       = useState("");
  const [saving, setSaving]   = useState(false);
  const [checking, setChecking] = useState(false);
  const [grammarData, setGrammarData] = useState(null);
  const [showGrammar, setShowGrammar] = useState(false);
  const [error, setError]     = useState("");
  const fileInputRef = useRef(null);
  const isEditing = Boolean(selectedNote);

  // Populate form when a note is selected for editing
  useEffect(() => {
    if (selectedNote) {
      setTitle(selectedNote.title || "");
      setContent(selectedNote.content || "");
      setTags(selectedNote.tags ? selectedNote.tags.join(", ") : "");
      setTab("write");
      setError("");
      setGrammarData(null);
      setShowGrammar(false);
    } else {
      setTitle("");
      setContent("");
      setTags("");
      setError("");
      setGrammarData(null);
      setShowGrammar(false);
    }
  }, [selectedNote]);

  // Parse tags string → array
  const parseTags = (str) =>
    str
      .split(",")
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);

  // Save / Update note
  const handleSave = useCallback(async () => {
    if (!title.trim()) { setError("Title is required."); return; }
    if (!content.trim()) { setError("Content cannot be empty."); return; }
    setSaving(true);
    setError("");
    try {
      const payload = { title: title.trim(), content, tags: parseTags(tags) };
      let saved;
      if (isEditing) {
        const res = await updateNote(selectedNote._id, payload);
        saved = res.data.data;
      } else {
        const res = await createNote(payload);
        saved = res.data.data;
      }
      onSaved(saved, isEditing ? "updated" : "created");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save note.");
    } finally {
      setSaving(false);
    }
  }, [title, content, tags, isEditing, selectedNote, onSaved]);

  // Grammar check
  const handleGrammarCheck = useCallback(async () => {
    if (!content.trim()) { setError("Write some content first."); return; }
    setChecking(true);
    setError("");
    try {
      const res = await checkGrammar(content);
      setGrammarData(res.data.data);
      setShowGrammar(true);
    } catch (err) {
      setError(err.response?.data?.message || "Grammar check failed.");
    } finally {
      setChecking(false);
    }
  }, [content]);

  // .md file upload
  const handleFileChange = useCallback((e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target.result;
      // Use filename (without ext) as title if title is empty
      if (!title) {
        setTitle(file.name.replace(/\.(md|markdown)$/i, ""));
      }
      setContent(text);
      setTab("write");
    };
    reader.readAsText(file);
    // Reset so same file can be re-selected
    e.target.value = "";
  }, [title]);

  const handleNewNote = () => {
    if (onCancel) onCancel();
  };

  const wordCount = content.trim()
    ? content.trim().split(/\s+/).length
    : 0;

  return (
    <div className="editor">
      {/* ── Top Bar ── */}
      <div className="editor-topbar">
        <input
          className="editor-title-input"
          type="text"
          placeholder="Note title…"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={120}
        />
        <div className="editor-topbar-actions">
          {isEditing && (
            <button className="btn btn-ghost" onClick={handleNewNote}>
              + New
            </button>
          )}
          <button
            className="btn btn-outline"
            onClick={() => fileInputRef.current.click()}
            title="Upload .md file"
          >
            📂 Upload
          </button>
          <button
            className="btn btn-outline"
            onClick={handleGrammarCheck}
            disabled={checking}
          >
            {checking ? "Checking…" : "✏️ Grammar"}
          </button>
          <button
            className="btn btn-primary"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Saving…" : isEditing ? "Update" : "Save Note"}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".md,.markdown"
            style={{ display: "none" }}
            onChange={handleFileChange}
          />
        </div>
      </div>

      {/* ── Tags ── */}
      <div className="editor-tags-row">
        <span className="editor-tags-icon">🏷️</span>
        <input
          className="editor-tags-input"
          type="text"
          placeholder="Add tags, comma-separated (e.g. work, ideas)"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
        />
      </div>

      {/* ── Error ── */}
      {error && <div className="editor-error">{error}</div>}

      {/* ── Tabs ── */}
      <div className="editor-tabs">
        <button
          className={`editor-tab ${tab === "write" ? "editor-tab--active" : ""}`}
          onClick={() => setTab("write")}
        >
          ✍️ Write
        </button>
        <button
          className={`editor-tab ${tab === "preview" ? "editor-tab--active" : ""}`}
          onClick={() => setTab("preview")}
        >
          👁️ Preview
        </button>
        <span className="editor-word-count">{wordCount} words</span>
      </div>

      {/* ── Write / Preview Pane ── */}
      <div className="editor-pane">
        {tab === "write" ? (
          <textarea
            className="editor-textarea"
            placeholder={"# Your note title\n\nStart writing in **Markdown**...\n\n- Use `code` for inline code\n- Add **bold** and _italic_ text\n- Create lists, links, and more!"}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            spellCheck={false}
          />
        ) : (
          <div className="editor-preview">
            {content.trim() ? (
              <div
                className="rendered-content"
                dangerouslySetInnerHTML={{ __html: marked.parse(content) }}
              />
            ) : (
              <div className="editor-preview-empty">
                <span>Nothing to preview yet. Switch to Write and add some content.</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Grammar Panel (floating) ── */}
      {showGrammar && grammarData && (
        <GrammarPanel
          grammar={grammarData}
          onClose={() => setShowGrammar(false)}
        />
      )}
    </div>
  );
}
