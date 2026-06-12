/**
 * middleware/upload.js — Multer File Upload Configuration
 *
 * Multer is the standard Node.js middleware for handling multipart/form-data
 * (the encoding type used for file uploads in HTML forms).
 *
 * Storage Strategy: memoryStorage()
 *   - Files land in RAM as a Buffer (req.file.buffer)
 *   - No files are written to disk — perfect for cloud deployments
 *     (e.g., Render, Railway) where the filesystem is ephemeral
 *   - We decode the buffer → string and store in MongoDB
 *
 * Interview tip: The alternative is diskStorage(), which writes to disk.
 * Use memoryStorage() for small files going straight to a database/cloud,
 * use diskStorage() or a cloud adapter (like multer-s3) for large files.
 */

const multer = require('multer');

// Keep file content in memory — no disk writes
const storage = multer.memoryStorage();

/**
 * fileFilter — only accept Markdown files.
 * Called by Multer for each file before it's processed.
 *
 * @param {Object} req  - Express request
 * @param {Object} file - The uploaded file metadata (no content yet)
 * @param {Function} cb - Callback: cb(error, acceptFile)
 */
const fileFilter = (req, file, cb) => {
  const originalName = file.originalname.toLowerCase();
  const isMarkdown =
    file.mimetype === 'text/markdown' ||
    file.mimetype === 'text/plain' ||
    originalName.endsWith('.md') ||
    originalName.endsWith('.markdown');

  if (isMarkdown) {
    cb(null, true); // null = no error, true = accept file
  } else {
    // Passing an Error causes Multer to reject the file and call next(err)
    cb(new Error('Only Markdown files (.md / .markdown) are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB maximum
  },
});

module.exports = upload;
