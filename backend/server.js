/**
 * server.js — Express Application Entry Point
 *
 * What this file does:
 *  1. Loads environment variables from .env
 *  2. Connects to MongoDB
 *  3. Sets up Express middleware (CORS, JSON parsing)
 *  4. Mounts API routes
 *  5. Starts the HTTP server
 *
 * Interview tip: This separation of concerns (config → db → middleware → routes)
 * is a common pattern in production Node.js apps.
 */

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const noteRoutes = require('./routes/noteRoutes');

// ── Load .env FIRST before anything else reads process.env ────────────────────
dotenv.config();

// ── Connect to MongoDB ────────────────────────────────────────────────────────
connectDB();

const app = express();

// ── Middleware ────────────────────────────────────────────────────────────────

/**
 * CORS (Cross-Origin Resource Sharing):
 * Our React frontend runs on port 5173, backend on 5000.
 * Without CORS headers, the browser blocks requests from a different origin.
 * We allow only our known frontend URL — never use '*' in production.
 */
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost:3000',
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.some(o => origin.startsWith(o.replace(/\/$/, '')))) {
        return callback(null, true);
      }
      console.error('CORS blocked:', origin, '| Allowed:', allowedOrigins);
      callback(new Error('CORS: Not allowed'));
    },
    credentials: true,
  })
);

/**
 * express.json() parses incoming requests with JSON payloads.
 * The 10mb limit prevents someone sending a gigantic payload to crash the server.
 */
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── Routes ────────────────────────────────────────────────────────────────────

app.use('/api/notes', noteRoutes);

// Root health-check endpoint — useful to verify the server is up
app.get('/', (req, res) => {
  res.json({
    message: '✅ Markdown Notes API is running!',
    version: '1.0.0',
    endpoints: {
      'GET    /api/notes': 'List all notes',
      'POST   /api/notes': 'Create a note (JSON body)',
      'POST   /api/notes/upload': 'Upload a .md file',
      'POST   /api/notes/grammar-check': 'Check grammar of text',
      'GET    /api/notes/:id': 'Get a single note',
      'GET    /api/notes/:id/render': 'Get rendered HTML',
      'PUT    /api/notes/:id': 'Update a note',
      'DELETE /api/notes/:id': 'Delete a note',
    },
  });
});

// ── Error Handlers ────────────────────────────────────────────────────────────

// 404 — No route matched
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

/**
 * Global error handler — Express calls this when next(err) is called.
 * The 4-parameter signature (err, req, res, next) is required by Express.
 */
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('💥 Global Error:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

// ── Start Server ──────────────────────────────────────────────────────────────

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(
    `🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`
  );
});

// Export for testing purposes
module.exports = app;
