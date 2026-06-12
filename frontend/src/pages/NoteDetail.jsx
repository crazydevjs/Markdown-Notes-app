import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { renderNote } from "../services/api";
import "./NoteDetail.css";

export default function NoteDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [note, setNote]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState("");

  useEffect(() => {
    const fetchRendered = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await renderNote(id);
        setNote(res.data.data);
      } catch (err) {
        setError(
          err.response?.status === 404
            ? "Note not found."
            : "Failed to load rendered note."
        );
      } finally {
        setLoading(false);
      }
    };
    fetchRendered();
  }, [id]);

  if (loading) {
    return (
      <div className="nd-state">
        <div className="spinner" />
        <p>Rendering note…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="nd-state nd-state--error">
        <span className="nd-state-icon">⚠️</span>
        <p>{error}</p>
        <button className="btn btn-primary" onClick={() => navigate("/")}>
          ← Back to Notes
        </button>
      </div>
    );
  }

  return (
    <div className="nd-wrapper">
      {/* ── Article ── */}
      <article className="nd-article">
        {/* Back button */}
        <button className="nd-back" onClick={() => navigate("/")}>
          ← Back
        </button>

        {/* Meta */}
        <header className="nd-header">
          <h1 className="nd-title">{note.title}</h1>

          <div className="nd-meta">
            {note.tags?.length > 0 && (
              <div className="nd-tags">
                {note.tags.map((tag) => (
                  <span key={tag} className="tag">
                    {tag}
                  </span>
                ))}
              </div>
            )}
            <div className="nd-stats">
              <span>📝 {note.wordCount} words</span>
              <span>
                🕒 {new Date(note.updatedAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>
          </div>
        </header>

        {/* Rendered HTML from server (/api/notes/:id/render) */}
        <div
          className="rendered-content nd-body"
          dangerouslySetInnerHTML={{ __html: note.html }}
        />
      </article>
    </div>
  );
}
