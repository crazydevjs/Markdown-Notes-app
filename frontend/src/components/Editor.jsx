import { useState, useRef, useCallback, useEffect } from 'react';
import { marked } from 'marked';
import GrammarPanel from './GrammarPanel';
import { checkGrammar, createNote, updateNote } from '../services/api';
import './Editor.css';

marked.setOptions({ gfm: true, breaks: true });

export default function Editor({ selectedNote, onSaved, onCancel }) {
  const [tab, setTab] = useState('write');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [saving, setSaving] = useState(false);
  const [checking, setChecking] = useState(false);
  const [grammarData, setGrammarData] = useState(null);
  const [showGrammar, setShowGrammar] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);
  const isEditing = Boolean(selectedNote);

  useEffect(() => {
    if (selectedNote) {
      setTitle(selectedNote.title || '');
      setContent(selectedNote.content || '');
      setTags(selectedNote.tags ? selectedNote.tags.join(', ') : '');
      setTab('write');
      setError('');
      setGrammarData(null);
      setShowGrammar(false);
    } else {
      setTitle('');
      setContent('');
      setTags('');
      setError('');
      setGrammarData(null);
      setShowGrammar(false);
    }
  }, [selectedNote]);

  const parseTags = (str) =>
    str.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean);

  const handleSave = useCallback(async () => {
    if (!title.trim()) { setError('Title is required.'); return; }
    if (!content.trim()) { setError('Content cannot be empty.'); return; }
    setSaving(true);
    setError('');
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
      onSaved(saved, isEditing ? 'updated' : 'created');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save note.');
    } finally {
      setSaving(false);
    }
  }, [title, content, tags, isEditing, selectedNote, onSaved]);

  const handleGrammarCheck = useCallback(async () => {
    if (!content.trim()) { setError('Write some content first.'); return; }
    setChecking(true);
    setError('');
    try {
      const res = await checkGrammar(content);
      setGrammarData(res.data.data);
      setShowGrammar(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Grammar check failed.');
    } finally {
      setChecking(false);
    }
  }, [content]);

  const handleFileChange = useCallback((e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      if (!title) setTitle(file.name.replace(/\.(md|markdown)$/i, ''));
      setContent(evt.target.result);
      setTab('write');
    };
    reader.readAsText(file);
    e.target.value = '';
  }, [title]);

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;

  return (
    <div className="editor">
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
            <button className="btn btn-ghost" onClick={onCancel}>+ New</button>
          )}
          <button className="btn btn-outline" onClick={() => fileInputRef.current.click()}>
            📂 Upload
          </button>
          <button className="btn btn-outline" onClick={handleGrammarCheck} disabled={checking}>
            {checking ? 'Checking…' : '✏️ Grammar'}
          </button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : isEditing ? 'Update' : 'Save Note'}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".md,.markdown"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
        </div>
      </div>

      <div className="editor-tags-row">
        <span className="editor-tags-icon">🏷️</span>
        <input
          className="editor-tags-input"
          type="text"
          placeholder="Tags, comma-separated (e.g. work, ideas)"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
        />
      </div>

      {error && <div className="editor-error">{error}</div>}

      <div className="editor-tabs">
        <button
          className={`editor-tab ${tab === 'write' ? 'editor-tab--active' : ''}`}
          onClick={() => setTab('write')}
        >✍️ Write</button>
        <button
          className={`editor-tab ${tab === 'preview' ? 'editor-tab--active' : ''}`}
          onClick={() => setTab('preview')}
        >👁️ Preview</button>
        <span className="editor-word-count">{wordCount} words</span>
      </div>

      <div className="editor-pane">
        {tab === 'write' ? (
          <textarea
            className="editor-textarea"
            placeholder={"# Your note title\n\nStart writing in **Markdown**..."}
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
                <span>Nothing to preview yet.</span>
              </div>
            )}
          </div>
        )}
      </div>

      {showGrammar && grammarData && (
        <GrammarPanel
          grammar={grammarData}
          onClose={() => setShowGrammar(false)}
        />
      )}
    </div>
  );
}
