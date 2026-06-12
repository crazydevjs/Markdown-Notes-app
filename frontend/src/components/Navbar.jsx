/**
 * components/Navbar.jsx — Top Navigation Bar
 *
 * Fixed at the top of every page. Contains:
 *   - Brand logo + app name
 *   - "New Note" button (navigates to / and clears selection)
 */

import { Link } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
  return (
    <nav className="navbar" role="navigation" aria-label="Main navigation">
      <div className="navbar-brand">
        {/* Link to home — clicking logo always goes back */}
        <Link to="/" className="navbar-logo" aria-label="MarkNotes home">
          {/* File document icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
          <span>MarkNotes</span>
        </Link>

        <span className="navbar-divider" aria-hidden="true" />
        <span className="navbar-tagline">Markdown Note-taking App</span>
      </div>

      <div className="navbar-actions">
        {/* Link component renders an <a> tag managed by React Router */}
        <Link to="/" state={{ newNote: true }} className="btn btn-primary btn-sm">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            width="14"
            height="14"
            aria-hidden="true"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          New Note
        </Link>
      </div>
    </nav>
  );
}

export default Navbar;
