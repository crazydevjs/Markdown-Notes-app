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
            <Route path="/" element={<Home />} />
            <Route path="/notes/:id" element={<NoteDetail />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
