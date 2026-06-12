import './GrammarPanel.css';

const TYPE_CONFIG = {
  'spelling': { label: 'Spelling', color: '#dc2626', bg: '#fee2e2' },
  'grammar': { label: 'Grammar', color: '#d97706', bg: '#fef3c7' },
  'punctuation': { label: 'Punctuation', color: '#0369a1', bg: '#e0f2fe' },
  'passive-voice': { label: 'Passive Voice', color: '#7c3aed', bg: '#ede9fe' },
  'wordy': { label: 'Wordy Phrase', color: '#b91c1c', bg: '#fee2e2' },
  'repeated-word': { label: 'Repeated Word', color: '#be185d', bg: '#fce7f3' },
  'style': { label: 'Style Tip', color: '#475569', bg: '#f1f5f9' },
};

function ScoreRing({ score }) {
  const color = score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444';
  const label = score >= 80 ? 'Great!' : score >= 60 ? 'OK' : 'Needs work';
  return (
    <div className="gp-score-ring" style={{ color }}>
      <span className="gp-score-num">{score}</span>
      <span className="gp-score-label">{label}</span>
    </div>
  );
}

function GrammarPanel({ grammar, onClose }) {
  const { suggestions, score, wordCount, issueCount } = grammar;

  return (
    <div className="gp-overlay" onClick={onClose}>
      <div className="gp-panel" onClick={(e) => e.stopPropagation()}>

        <div className="gp-header">
          <div className="gp-header-left">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
            <h3>Grammar Check</h3>
          </div>
          <button className="gp-close" onClick={onClose}>✕</button>
        </div>

        <div className="gp-summary">
          <ScoreRing score={score} />
          <div className="gp-stats">
            <div className="gp-stat">
              <span className="gp-stat-value">{wordCount}</span>
              <span className="gp-stat-label">Words</span>
            </div>
            <div className="gp-divider" />
            <div className="gp-stat">
              <span className="gp-stat-value" style={{ color: issueCount > 0 ? '#ef4444' : '#10b981' }}>
                {issueCount}
              </span>
              <span className="gp-stat-label">{issueCount === 1 ? 'Issue' : 'Issues'}</span>
            </div>
          </div>
        </div>

        <div className="gp-body">
          {suggestions.length === 0 ? (
            <div className="gp-perfect">
              <span>✅</span>
              <p>No issues found — excellent writing!</p>
            </div>
          ) : (
            <>
              <p className="gp-body-title">{issueCount} suggestion{issueCount !== 1 ? 's' : ''}:</p>
              <ul className="gp-suggestion-list">
                {suggestions.map((s, i) => {
                  const cfg = TYPE_CONFIG[s.type] || TYPE_CONFIG.style;
                  return (
                    <li key={i} className="gp-suggestion-item">
                      <div className="gp-suggestion-top">
                        <span className="gp-suggestion-word" style={{ background: cfg.bg, color: cfg.color }}>
                          "{s.word}"
                        </span>
                        <span className="gp-suggestion-type" style={{ background: cfg.bg, color: cfg.color }}>
                          {cfg.label}
                        </span>
                      </div>
                      <p className="gp-suggestion-reason">{s.reason}</p>
                      {s.replacements?.length > 0 && (
                        <p className="gp-suggestion-fix">
                          ✅ {s.replacements.join(' / ')}
                        </p>
                      )}
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </div>

        <div className="gp-legend">
          {Object.entries(TYPE_CONFIG).map(([key, val]) => (
            <span key={key} className="gp-legend-item" style={{ background: val.bg, color: val.color }}>
              {val.label}
            </span>
          ))}
        </div>

      </div>
    </div>
  );
}

export default GrammarPanel;
