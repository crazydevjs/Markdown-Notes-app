/**
 * components/NoteList.jsx — Sidebar with All Saved Notes
 *
 * Props:
 *   notes      — array of note objects (from GET /api/notes)
 *   loading    — boolean, shows spinner while fetching
 *   selectedId — _id of the currently open note (highlights it)
 *   onSelect   — callback(note) when user clicks a note
 *   onDelete   — callback(id) when user confirms deletion
 */

import { useState } from 'react';
import './NoteList.css';

function NoteList({ notes, loading, selectedId, onSelect, onDelete }) {
  const [search, setSearch] = useState('');

  // Filter notes by title OR tags
  const filtered = notes.filter(
    (n) =>
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.tags.some((t) => t.includes(search.toLowerCase()))
  );

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now - d) / 86400000);

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  const handleDelete = (e, id) => {
    e.stopPropagation(); // Don't trigger note selection
    if (window.confirm('Delete this note permanently?')) {
      onDelete(id);
    }
  };

  return (
    <aside className="note-list" aria-label="Notes list">

      {/* Header: title + search */}
      <div className="nl-header">
        <div className="nl-title-row">
          <h2 className="nl-title">Notes</h2>
          {notes.length > 0 && (
            <span className="nl-count" aria-label={`${notes.length} notes`}>
              {notes.length}
            </span>
          )}
        </div>

        <div className="nl-search-wrap">
          <svg className="nl-search-icon" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="search"
            className="form-input nl-search"
            placeholder="Search by title or tag…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search notes"
          />
        </div>
      </div>

      {/* Body: list or states */}
      <div className="nl-body">
        {loading ? (
          <div className="nl-state">
            <div className="spinner" style={{ borderTopColor: 'var(--primary)' }} />
            <span>Loading…</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="nl-state nl-empty">
            {search ? (
              <>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <p>No results for <strong>"{search}"</strong></p>
                <button className="btn btn-secondary btn-sm"
                  onClick={() => setSearch('')}>Clear</button>
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
                <p>No notes yet</p>
                <span className="nl-hint">Write your first note →</span>
              </>
            )}
          </div>
        ) : (
          <ul className="nl-ul" role="list">
            {filtered.map((note) => (
              <li
                key={note._id}
                className={`nl-item ${selectedId === note._id ? 'nl-item--active' : ''}`}
                onClick={() => onSelect(note)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && onSelect(note)}
                aria-current={selectedId === note._id ? 'true' : 'false'}
              >
                {/* Title row */}
                <div className="nl-item-top">
                  <span className="nl-item-title">{note.title}</span>
                  <button
                    className="nl-delete-btn"
                    onClick={(e) => handleDelete(e, note._id)}
                    aria-label={`Delete "${note.title}"`}
                    title="Delete note"
                  >
                    ×
                  </button>
                </div>

                {/* Meta: date + word count */}
                <div className="nl-item-meta">
                  <span>{formatDate(note.updatedAt)}</span>
                  <span>·</span>
                  <span>{note.wordCount} words</span>
                  {note.fileName && (
                    <>
                      <span>·</span>
                      <span className="nl-file-badge" title={note.fileName}>📎</span>
                    </>
                  )}
                </div>

                {/* Tags */}
                {note.tags.length > 0 && (
                  <div className="nl-item-tags">
                    {note.tags.slice(0, 4).map((tag) => (
                      <span key={tag} className="tag">{tag}</span>
                    ))}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  );
}

export default NoteList;
