/**
 * routes/noteRoutes.js — Express Router
 *
 * Routes are registered in a specific order — this matters!
 *
 * IMPORTANT: '/grammar-check' and '/upload' MUST come BEFORE '/:id'.
 * If '/:id' came first, Express would treat the literal string
 * "grammar-check" as a MongoDB ObjectId — causing a CastError.
 *
 * router.route() lets us chain multiple HTTP methods on the same path
 * neatly: .get(fn).post(fn) instead of two separate router.get / router.post calls.
 */

const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const {
  getNotes,
  getNoteById,
  renderNote,
  createNote,
  uploadNote,
  updateNote,
  deleteNote,
  checkGrammar,
} = require('../controllers/noteController');

// ── Special routes (MUST be before /:id) ─────────────────────────────────────

// POST /api/notes/grammar-check
router.post('/grammar-check', checkGrammar);

// POST /api/notes/upload
// upload.single('file') — Multer middleware, processes the field named "file"
router.post('/upload', upload.single('file'), uploadNote);

// ── Standard CRUD ─────────────────────────────────────────────────────────────

// GET  /api/notes  → list all notes
// POST /api/notes  → create a note from JSON body
router.route('/').get(getNotes).post(createNote);

// GET    /api/notes/:id  → get one note with full content
// PUT    /api/notes/:id  → update a note
// DELETE /api/notes/:id  → delete a note
router.route('/:id').get(getNoteById).put(updateNote).delete(deleteNote);

// GET /api/notes/:id/render → get rendered HTML of a note
// This comes AFTER /:id to keep things readable (it's a sub-resource)
router.get('/:id/render', renderNote);

module.exports = router;
