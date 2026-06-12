/**
 * services/api.js — Centralised API Layer (Axios)
 *
 * Why a separate API service file?
 *   - All fetch logic in ONE place — if the API URL changes, update here only
 *   - Components stay clean (no fetch/axios code scattered everywhere)
 *   - Easy to mock during testing
 *
 * How BASE_URL works:
 *   Development:  VITE_API_URL is NOT set → axios uses '/api'
 *                 Vite's proxy forwards '/api/*' → 'http://localhost:5000/api/*'
 *
 *   Production:   VITE_API_URL = 'https://your-backend.onrender.com'
 *                 axios uses 'https://your-backend.onrender.com/api'
 *
 * import.meta.env is Vite's way to read environment variables.
 * Only variables prefixed with VITE_ are exposed to the browser.
 */

import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api';

// Create a reusable axios instance with shared config
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ── Notes API ─────────────────────────────────────────────────────────────────

/** Fetch all notes (metadata only — no content field) */
export const getNotes = () => api.get('/notes');

/** Fetch a single note by ID (includes full content) */
export const getNoteById = (id) => api.get(`/notes/${id}`);

/**
 * Fetch rendered HTML of a note.
 * The server runs marked() and returns the HTML string in data.html.
 */
export const renderNote = (id) => api.get(`/notes/${id}/render`);

/** Create a note from a JSON body { title, content, tags } */
export const createNote = (data) => api.post('/notes', data);

/**
 * Upload a .md file as a new note.
 * Must use multipart/form-data — we override the Content-Type header for this.
 */
export const uploadNote = (formData) =>
  api.post('/notes/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

/** Update a note by ID */
export const updateNote = (id, data) => api.put(`/notes/${id}`, data);

/** Delete a note by ID */
export const deleteNote = (id) => api.delete(`/notes/${id}`);

/**
 * Check grammar of text.
 * Sends { text: markdownString } and receives suggestions + score.
 */
export const checkGrammar = (text) =>
  api.post('/notes/grammar-check', { text });
