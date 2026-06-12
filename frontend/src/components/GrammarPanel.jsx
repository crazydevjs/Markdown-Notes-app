/**
 * components/GrammarPanel.jsx — Grammar Check Results Drawer
 *
 * Displayed as a floating panel (modal-like) over the editor.
 * Clicking the overlay closes it.
 *
 * Props:
 *   grammar  — { suggestions, score, wordCount, issueCount } from the API
 *   onClose  — function to hide the panel
 */

import './GrammarPanel.css';

// Configuration for each suggestion type — colours + labels
const TYPE_CONFIG = {
  'passive-voice':  { label: 'Passive Voice',   color: '#d97706', bg: '#fef3c7' },
  'weasel-word':    { label: 'Weasel Word',      color: '#7c3aed', bg: '#ede9fe' },
  'adverb':         { label: 'Adverb',           color: '#0369a1', bg: '#e0f2fe' },
  'wordy':          { label: 'Wordy Phrase',     color: '#b91c1c', bg: '#fee2e2' },
  'repeated-word':  { label: 'Repeated Word',    color: '#be185d', bg: '#fce7f3' },
  'sentence-start': { label: 'Sentence Start',   color: '#065f46', bg: '#d1fae5' },
  'style':          { label: 'Style Tip',        color: '#475569', bg: '#f1f5f9' },
};

/**
 * ScoreRing — circular score display (0–100)
 * Colour changes based on score: green ≥ 80, amber ≥ 60, red < 60
 */
function ScoreRing({ score }) {
  const color =
    score >= 80 ? '#10b981' :
    score >= 60 ? '#f59e0b' :
                  '#ef4444';
  const label =
    score >= 80 ? 'Great!'   :
    score >= 60 ? 'OK'       :
                  'Needs work';

  return (
    <div className="gp-score-ring" style={{ '--ring-color': color }}
      aria-label={`Grammar score: ${score} out of 100`}>
      <span className="gp-score-num" style={{ color }}>{score}</span>
      <span className="gp-score-label" style={{ color }}>{label}</span>
    </div>
  );
}

function GrammarPanel({ grammar, onClose }) {
  const { suggestions, score, wordCount, issueCount } = grammar;

  return (
    /* Clicking the dark overlay closes the panel */
    <div
      className="gp-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Grammar check results"
    >
      <div className="gp-panel" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="gp-header">
          <div className="gp-header-left">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              width="18" height="18" aria-hidden="true">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
            <h3>Grammar Check</h3>
          </div>
          <button className="gp-close" onClick={onClose} aria-label="Close grammar panel">
            ✕
          </button>
        </div>

        {/* Summary: score ring + stats */}
        <div className="gp-summary">
          <ScoreRing score={score} />
          <div className="gp-stats">
            <div className="gp-stat">
              <span className="gp-stat-value">{wordCount}</span>
              <span className="gp-stat-label">Words</span>
            </div>
            <div className="gp-divider" aria-hidden="true" />
            <div className="gp-stat">
              <span
                className="gp-stat-value"
                style={{ color: issueCount > 0 ? 'var(--danger)' : 'var(--success)' }}
              >
                {issueCount}
              </span>
              <span className="gp-stat-label">
                {issueCount === 1 ? 'Issue' : 'Issues'}
              </span>
            </div>
          </div>
        </div>

        {/* Suggestions list */}
        <div className="gp-body">
          {suggestions.length === 0 ? (
            <div className="gp-perfect">
              <span role="img" aria-label="check mark">✅</span>
              <p>No issues found — excellent writing!</p>
            </div>
          ) : (
            <>
              <p className="gp-body-title">
                {issueCount} suggestion{issueCount !== 1 ? 's' : ''}:
              </p>
              <ul className="gp-suggestion-list" role="list">
                {suggestions.map((s, i) => {
                  const cfg = TYPE_CONFIG[s.type] || TYPE_CONFIG.style;
                  return (
                    <li key={i} className="gp-suggestion-item">
                      <div className="gp-suggestion-top">
                        <span
                          className="gp-suggestion-word"
                          style={{ background: cfg.bg, color: cfg.color }}
                          title="Problematic phrase"
                        >
                          "{s.word}"
                        </span>
                        <span
                          className="gp-suggestion-type"
                          style={{ background: cfg.bg, color: cfg.color }}
                        >
                          {cfg.label}
                        </span>
                      </div>
                      <p className="gp-suggestion-reason">{s.reason}</p>
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </div>

        {/* Legend */}
        <div className="gp-legend" aria-label="Issue type legend">
          {Object.entries(TYPE_CONFIG).map(([key, val]) => (
            <span
              key={key}
              className="gp-legend-item"
              style={{ background: val.bg, color: val.color }}
            >
              {val.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default GrammarPanel;
