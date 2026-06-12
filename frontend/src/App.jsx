/**
 * App.jsx — Root Component & Client-Side Router
 *
 * React Router v6 setup:
 *   BrowserRouter — uses the HTML5 History API (clean URLs like /notes/123)
 *   Routes        — container for all route definitions
 *   Route         — maps a URL path to a component
 *
 * The layout is:
 *   ┌────────────────────┐
 *   │      <Navbar>      │  ← fixed at top, always visible
 *   ├────────────────────┤
 *   │   <Routes> (page)  │  ← changes based on URL
 *   └────────────────────┘
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Home from './pages/Home.jsx';
import NoteDetail from './pages/NoteDetail.jsx';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app-wrapper">
        <Navbar />
        <main className="app-main">
          <Routes>
            {/* Home: sidebar + editor */}
            <Route path="/" element={<Home />} />

            {/* Full rendered view of a single note */}
            <Route path="/notes/:id" element={<NoteDetail />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
