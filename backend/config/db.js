/**
 * config/db.js — MongoDB Connection
 *
 * Why async/await?
 *   mongoose.connect() returns a Promise. We await it to catch errors cleanly.
 *
 * Why process.exit(1)?
 *   If the database is unavailable, the API is broken.
 *   It's better to crash immediately ("fail fast") than to run in a broken state
 *   where every request fails silently.
 */

const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);

    // conn.connection.host shows which MongoDB server we're connected to
    // Helpful for debugging (e.g., confirming you're on Atlas, not localhost)
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB connection failed: ${error.message}`);
    process.exit(1); // Exit with failure code
  }
};

module.exports = connectDB;
