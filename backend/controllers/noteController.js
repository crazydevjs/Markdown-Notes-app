/**
 * controllers/noteController.js — Business Logic for All Endpoints
 *
 * Controller Pattern:
 *   Routes define WHAT URL triggers an action.
 *   Controllers define WHAT HAPPENS when that URL is hit.
 *   This separation keeps routes thin and logic testable.
 *
 * Each controller function follows the pattern:
 *   async (req, res) => { try { ... res.json(...) } catch(err) { res.status(500)... } }
 */

const Note = require('../models/Note');
const { marked } = require('marked');
const writeGood = require('write-good');

// ── Configure marked (Markdown parser) ───────────────────────────────────────
marked.setOptions({
  breaks: true, // Convert single \n to <br> (like GitHub)
  gfm: true,    // GitHub Flavored Markdown: tables, strikethrough, task lists
});

// ── Helper Utilities ──────────────────────────────────────────────────────────

/**
 * stripMarkdown() — Remove Markdown syntax to get plain text.
 * Used before grammar checking so code blocks / links don't trigger false positives.
 */
const stripMarkdown = (md) =>
  md
    .replace(/```[\s\S]*?```/g, ' ')          // Fenced code blocks → space
    .replace(/`[^`]*`/g, ' ')                 // Inline code → space
    .replace(/#{1,6}\s?/g, '')                // Heading markers
    .replace(/(\*\*|__)(.*?)\1/g, '$2')       // Bold → keep text
    .replace(/(\*|_)(.*?)\1/g, '$2')          // Italic → keep text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')  // Links → keep label
    .replace(/!\[[^\]]*\]\([^)]+\)/g, '')     // Images → remove
    .replace(/^[>*+\-]\s+/gm, '')            // Blockquote & list markers
    .replace(/\n{2,}/g, ' ')                  // Multiple newlines → space
    .trim();

/**
 * categorize() — Map a write-good reason string to a readable category label.
 */
const categorize = (reason) => {
  if (/passive voice/i.test(reason)) return 'passive-voice';
  if (/weasel/i.test(reason)) return 'weasel-word';
  if (/adverb/i.test(reason)) return 'adverb';
  if (/wordy/i.test(reason)) return 'wordy';
  if (/lexical illusion/i.test(reason)) return 'repeated-word';
  if (/so at the beginning/i.test(reason)) return 'sentence-start';
  return 'style';
};

/**
 * calculateScore() — Grammar quality score from 0–100.
 * Formula: start at 100, subtract penalty per issue relative to word count.
 * More words = more tolerance for a few issues (ratio-based).
 */
const calculateScore = (suggestions, wordCount) => {
  if (wordCount === 0) return 100;
  const penalty = (suggestions.length / wordCount) * 200;
  return Math.max(0, Math.min(100, Math.round(100 - penalty)));
};

// ── Controller Functions ──────────────────────────────────────────────────────

/**
 * @desc   Get all notes — returns metadata only (no content)
 * @route  GET /api/notes
 * @access Public
 *
 * We use .select() to exclude the 'content' field — the sidebar only needs
 * title/tags/dates. Sending content for every note in the list would be slow.
 */
const getNotes = async (req, res) => {
  try {
    const notes = await Note.find()
      .select('title tags wordCount fileName createdAt updatedAt')
      .sort({ updatedAt: -1 }); // Newest-updated first

    res.json({ success: true, count: notes.length, data: notes });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @desc   Get a single note with full content
 * @route  GET /api/notes/:id
 * @access Public
 */
const getNoteById = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ success: false, message: 'Note not found' });
    }
    res.json({ success: true, data: note });
  } catch (err) {
    // Mongoose throws a CastError if :id is not a valid ObjectId format
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @desc   Render a note's Markdown as HTML (server-side rendering)
 * @route  GET /api/notes/:id/render
 * @access Public
 *
 * Interview talking point:
 *   Server-side rendering with marked() is safer than client-side because:
 *   1. marked can be configured with DOMPurify on the server to sanitise HTML
 *   2. Keeps rendering logic in one place — easier to upgrade the markdown parser
 *   3. The client receives ready-to-display HTML, no JS parsing needed
 */
const renderNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ success: false, message: 'Note not found' });
    }

    // marked() converts Markdown string → HTML string
    const html = marked(note.content);

    res.json({
      success: true,
      data: {
        _id: note._id,
        title: note.title,
        html,                          // ← This is what the frontend renders
        wordCount: note.wordCount,
        tags: note.tags,
        fileName: note.fileName,
        createdAt: note.createdAt,
        updatedAt: note.updatedAt,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @desc   Create a new note from a JSON request body
 * @route  POST /api/notes
 * @body   { title: string, content: string, tags?: string[] }
 * @access Public
 */
const createNote = async (req, res) => {
  try {
    const { title, content, tags } = req.body;

    if (!title || !content) {
      // 400 Bad Request — client sent incomplete data
      return res.status(400).json({
        success: false,
        message: 'Title and content are both required',
      });
    }

    // Note.create() = new Note({ ... }).save()
    // The pre-save hook runs automatically, calculating wordCount
    const note = await Note.create({
      title: title.trim(),
      content,
      tags: Array.isArray(tags) ? tags : [],
    });

    // 201 Created — resource was successfully created
    res.status(201).json({ success: true, data: note });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

/**
 * @desc   Upload a .md file and save as a note
 * @route  POST /api/notes/upload
 * @body   multipart/form-data: file (.md file), title? (string), tags? (CSV string)
 * @access Public
 *
 * Interview talking point about Multer memoryStorage:
 *   req.file.buffer is a Node.js Buffer (raw bytes).
 *   .toString('utf-8') decodes the bytes into a readable JavaScript string.
 *   This approach never writes to disk — great for serverless / PaaS deployments.
 */
const uploadNote = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded. Please send a .md file as "file" field.',
      });
    }

    // Decode the raw buffer to a UTF-8 string
    const content = req.file.buffer.toString('utf-8');

    // Title priority: body.title → filename without extension → 'Untitled Note'
    const title =
      req.body.title ||
      req.file.originalname.replace(/\.(md|markdown)$/i, '') ||
      'Untitled Note';

    // tags come as a comma-separated string in form data
    const tags = req.body.tags
      ? req.body.tags.split(',').map((t) => t.trim()).filter(Boolean)
      : [];

    const note = await Note.create({
      title,
      content,
      fileName: req.file.originalname, // Remember the original filename
      tags,
    });

    res.status(201).json({ success: true, data: note });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

/**
 * @desc   Update an existing note
 * @route  PUT /api/notes/:id
 * @body   { title?, content?, tags? }
 * @access Public
 */
const updateNote = async (req, res) => {
  try {
    const note = await Note.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,           // Return the updated document (not the old one)
        runValidators: true, // Re-run schema validators (e.g., maxlength on title)
      }
    );

    if (!note) {
      return res.status(404).json({ success: false, message: 'Note not found' });
    }

    res.json({ success: true, data: note });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

/**
 * @desc   Delete a note by ID
 * @route  DELETE /api/notes/:id
 * @access Public
 */
const deleteNote = async (req, res) => {
  try {
    const note = await Note.findByIdAndDelete(req.params.id);

    if (!note) {
      return res.status(404).json({ success: false, message: 'Note not found' });
    }

    res.json({ success: true, message: 'Note deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @desc   Check grammar of provided Markdown text
 * @route  POST /api/notes/grammar-check
 * @body   { text: string }
 * @access Public
 *
 * How write-good works:
 *   It scans text for common English writing problems:
 *   - Passive voice: "was killed by" instead of "killed"
 *   - Weasel words: "very", "quite", "rather" (weaken your writing)
 *   - Adverb overuse: "-ly" words that could be replaced with stronger verbs
 *   - Wordy phrases: "in order to" → "to"
 *
 * Each suggestion = { index, offset, reason }
 *   index  → character position in the string
 *   offset → length of the problematic phrase
 *   reason → human-readable explanation
 */
const checkGrammar = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Text is required for grammar check',
      });
    }

    // Step 1: Strip Markdown so code blocks don't produce false positives
    const plainText = stripMarkdown(text);

    // Step 2: Run write-good NLP analysis
    const rawSuggestions = writeGood(plainText);

    // Step 3: Enrich suggestions with extra metadata
    const suggestions = rawSuggestions.map((s) => ({
      index: s.index,
      offset: s.offset,
      word: plainText.substr(s.index, s.offset), // Extract the problematic phrase
      reason: s.reason,
      type: categorize(s.reason),                 // Our readable category
    }));

    // Step 4: Calculate metrics
    const wordCount = plainText
      .split(/\s+/)
      .filter((w) => w.length > 0).length;

    const score = calculateScore(suggestions, wordCount);

    res.json({
      success: true,
      data: {
        suggestions,
        score,
        wordCount,
        issueCount: suggestions.length,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Export all controllers so the router can use them
module.exports = {
  getNotes,
  getNoteById,
  renderNote,
  createNote,
  uploadNote,
  updateNote,
  deleteNote,
  checkGrammar,
};
