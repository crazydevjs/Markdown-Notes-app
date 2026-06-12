import { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import NoteList from "../components/NoteList";
import Editor from "../components/Editor";
import { getNotes, getNoteById, deleteNote } from "../services/api";
import "./Home.css";

export default function Home() {
  const [notes, setNotes] = useState([]);
  const location = useLocation();
  const [selectedNote, setSelectedNote] = useState(null); // full note with content
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null); // { msg, type }

  // ── Fetch note list ─────────────────────────────────────────────────────
  const loadNotes = useCallback(async () => {
    try {
      const res = await getNotes();
      setNotes(res.data.data || []);
    } catch {
      showToast("Failed to load notes.", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  useEffect(() => {
    if (location.state?.newNote) {
      setSelectedNote(null);
      window.history.replaceState({}, "");
    }
  }, [location.state]);
  // ── Toast helper ────────────────────────────────────────────────────────
  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ── Select note (load full content) ────────────────────────────────────
  const handleSelectNote = useCallback(async (note) => {
    try {
      const res = await getNoteById(note._id);
      setSelectedNote(res.data.data);
    } catch {
      showToast("Could not load note content.", "error");
    }
  }, []);

  // ── Delete note ─────────────────────────────────────────────────────────
  const handleDelete = useCallback(async (id) => {
    try {
      await deleteNote(id);
      setNotes((prev) => prev.filter((n) => n._id !== id));
      if (selectedNote?._id === id) setSelectedNote(null);
      showToast("Note deleted.");
    } catch {
      showToast("Failed to delete note.", "error");
    }
  }, [selectedNote]);

  // ── After save / update ─────────────────────────────────────────────────
  const handleSaved = useCallback((savedNote, action) => {
    if (action === "created") {
      // Prepend to list (most recent first)
      setNotes((prev) => [savedNote, ...prev]);
    } else {
      // Replace in list
      setNotes((prev) =>
        prev.map((n) => (n._id === savedNote._id ? savedNote : n))
      );
    }
    setSelectedNote(savedNote);
    showToast(
      action === "created" ? "Note saved! 🎉" : "Note updated! ✅"
    );
  }, []);

  // ── Deselect (new note) ─────────────────────────────────────────────────
  const handleCancel = useCallback(() => {
    setSelectedNote(null);
  }, []);

  return (
    <div className="home">
      {/* ── Sidebar ── */}
      <aside className="home-sidebar">
        {loading ? (
          <div className="home-loading">
            <div className="spinner" />
          </div>
        ) : (
          <NoteList
            notes={notes}
            selectedId={selectedNote?._id}
            onSelect={handleSelectNote}
            onDelete={handleDelete}
          />
        )}
      </aside>

      {/* ── Main Editor Area ── */}
      <main className="home-main">
        <Editor
          selectedNote={selectedNote}
          onSaved={handleSaved}
          onCancel={handleCancel}
        />
      </main>

      {/* ── Toast ── */}
      {toast && (
        <div className={`toast toast--${toast.type}`}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}
