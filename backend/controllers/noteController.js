const Note = require('../models/Note');
const { marked } = require('marked');

marked.setOptions({ breaks: true, gfm: true });

const stripMarkdown = (md) =>
  md
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]*`/g, ' ')
    .replace(/#{1,6}\s?/g, '')
    .replace(/(\*\*|__)(.*?)\1/g, '$2')
    .replace(/(\*|_)(.*?)\1/g, '$2')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/!\[[^\]]*\]\([^)]+\)/g, '')
    .replace(/^[>*+\-]\s+/gm, '')
    .replace(/\n{2,}/g, ' ')
    .trim();

const categorize = (categoryId) => {
  const map = {
    TYPOS: 'spelling',
    GRAMMAR: 'grammar',
    PUNCTUATION: 'punctuation',
    STYLE: 'style',
    CASING: 'style',
    CONFUSED_WORDS: 'grammar',
    REDUNDANCY: 'wordy',
  };
  return map[categoryId] || 'style';
};

const calculateScore = (suggestions, wordCount) => {
  if (wordCount === 0) return 100;
  const penalty = (suggestions.length / wordCount) * 200;
  return Math.max(0, Math.min(100, Math.round(100 - penalty)));
};

const getNotes = async (req, res) => {
  try {
    const notes = await Note.find()
      .select('title tags wordCount fileName createdAt updatedAt')
      .sort({ updatedAt: -1 });
    res.json({ success: true, count: notes.length, data: notes });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getNoteById = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ success: false, message: 'Note not found' });
    res.json({ success: true, data: note });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const renderNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ success: false, message: 'Note not found' });
    const html = marked(note.content);
    res.json({
      success: true,
      data: {
        _id: note._id,
        title: note.title,
        html,
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

const createNote = async (req, res) => {
  try {
    const { title, content, tags } = req.body;
    if (!title || !content) {
      return res.status(400).json({ success: false, message: 'Title and content are both required' });
    }
    const note = await Note.create({
      title: title.trim(),
      content,
      tags: Array.isArray(tags) ? tags : [],
    });
    res.status(201).json({ success: true, data: note });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

const uploadNote = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded. Send a .md file as "file" field.' });
    }
    const content = req.file.buffer.toString('utf-8');
    const title =
      req.body.title ||
      req.file.originalname.replace(/\.(md|markdown)$/i, '') ||
      'Untitled Note';
    const tags = req.body.tags
      ? req.body.tags.split(',').map((t) => t.trim()).filter(Boolean)
      : [];
    const note = await Note.create({ title, content, fileName: req.file.originalname, tags });
    res.status(201).json({ success: true, data: note });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

const updateNote = async (req, res) => {
  try {
    const note = await Note.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!note) return res.status(404).json({ success: false, message: 'Note not found' });
    res.json({ success: true, data: note });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

const deleteNote = async (req, res) => {
  try {
    const note = await Note.findByIdAndDelete(req.params.id);
    if (!note) return res.status(404).json({ success: false, message: 'Note not found' });
    res.json({ success: true, message: 'Note deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const checkGrammar = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || text.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Text is required for grammar check' });
    }

    const plainText = stripMarkdown(text);

    const params = new URLSearchParams();
    params.append('text', plainText);
    params.append('language', 'en-US');

    const response = await fetch('https://api.languagetool.org/v2/check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
      signal: AbortSignal.timeout(10000),
    });

    const data = await response.json();

    const suggestions = data.matches.map((match) => ({
      index: match.offset,
      offset: match.length,
      word: plainText.substr(match.offset, match.length),
      reason: match.message,
      type: categorize(match.rule.category.id),
      replacements: match.replacements.slice(0, 3).map((r) => r.value),
    }));

    const wordCount = plainText.split(/\s+/).filter((w) => w.length > 0).length;
    const score = calculateScore(suggestions, wordCount);

    res.json({
      success: true,
      data: { suggestions, score, wordCount, issueCount: suggestions.length },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getNotes, getNoteById, renderNote, createNote, uploadNote, updateNote, deleteNote, checkGrammar };
