/**
 * main.jsx — React Application Entry Point
 *
 * ReactDOM.createRoot() is the React 18 way to mount the app.
 * StrictMode renders components twice in development to catch side effects —
 * completely harmless and very useful for finding bugs early.
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
