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

router.post('/grammar-check', checkGrammar);
router.post('/upload', upload.single('file'), uploadNote);
router.route('/').get(getNotes).post(createNote);
router.route('/:id').get(getNoteById).put(updateNote).delete(deleteNote);
router.get('/:id/render', renderNote);

module.exports = router;
