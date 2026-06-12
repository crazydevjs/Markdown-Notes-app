const multer = require('multer');

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const name = file.originalname.toLowerCase();
  const isMarkdown =
    file.mimetype === 'text/markdown' ||
    file.mimetype === 'text/plain' ||
    name.endsWith('.md') ||
    name.endsWith('.markdown');

  if (isMarkdown) {
    cb(null, true);
  } else {
    cb(new Error('Only Markdown files (.md / .markdown) are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

module.exports = upload;
