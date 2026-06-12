import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import NoteList from '../components/NoteList';
import Editor from '../components/Editor';
import { getNotes, getNoteById, deleteNote } from '../services/api';
import './Home.css';

export default function Home() {
  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const location = useLocation();

  const loadNotes = useCallback(async () => {
    try {
      const res = await getNotes();
      setNotes(res.data.data || []);
    } catch {
      showToast('Failed to load notes.', 'error');
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
      window.history.replaceState({}, '');
    }
  }, [location.state]);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSelectNote = useCallback(async (note) => {
    try {
      const res = await getNoteById(note._id);
      setSelectedNote(res.data.data);
    } catch {
      showToast('Could not load note content.', 'error');
    }
  }, []);

  const handleDelete = useCallback(async (id) => {
    try {
      await deleteNote(id);
      setNotes((prev) => prev.filter((n) => n._id !== id));
      if (selectedNote?._id === id) setSelectedNote(null);
      showToast('Note deleted.');
    } catch {
      showToast('Failed to delete note.', 'error');
    }
  }, [selectedNote]);

  const handleSaved = useCallback((savedNote, action) => {
    if (action === 'created') {
      setNotes((prev) => [savedNote, ...prev]);
    } else {
      setNotes((prev) => prev.map((n) => (n._id === savedNote._id ? savedNote : n)));
    }
    setSelectedNote(savedNote);
    showToast(action === 'created' ? 'Note saved! 🎉' : 'Note updated! ✅');
  }, []);

  const handleCancel = useCallback(() => {
    setSelectedNote(null);
  }, []);

  return (
    <div className="home">
      <aside className="home-sidebar">
        {loading ? (
          <div className="home-loading"><div className="spinner" /></div>
        ) : (
          <NoteList
            notes={notes}
            selectedId={selectedNote?._id}
            onSelect={handleSelectNote}
            onDelete={handleDelete}
          />
        )}
      </aside>

      <main className="home-main">
        <Editor
          selectedNote={selectedNote}
          onSaved={handleSaved}
          onCancel={handleCancel}
        />
      </main>

      {toast && (
        <div className={`toast toast--${toast.type}`}>{toast.msg}</div>
      )}
    </div>
  );
}
