const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const noteRoutes = require('./routes/noteRoutes');

dotenv.config();
connectDB();

const app = express();

const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost:3000',
].filter(Boolean);

// Allow configured origins, local dev, and any Vercel deployment
// (production + preview URLs) so the API keeps working even if
// FRONTEND_URL isn't set to the exact current frontend URL.
const isAllowedOrigin = (origin) => {
  if (!origin) return true; // non-browser clients (curl, server-to-server)
  if (allowedOrigins.some((o) => origin.startsWith(o.replace(/\/$/, '')))) {
    return true;
  }
  try {
    return new URL(origin).hostname.endsWith('.vercel.app');
  } catch {
    return false;
  }
};

app.use(
  cors({
    // Return false (not throw) for disallowed origins — the browser still
    // blocks the request, but we avoid noisy 500s in the logs.
    origin: (origin, callback) => callback(null, isAllowedOrigin(origin)),
    credentials: true,
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/api/notes', noteRoutes);

app.get('/', (req, res) => {
  res.json({ message: '✅ Markdown Notes API is running!' });
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

app.use((err, req, res, next) => {
  console.error('💥 Error:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

module.exports = app;
