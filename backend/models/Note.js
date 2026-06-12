/**
 * models/Note.js — Mongoose Schema & Model
 *
 * This defines the "shape" of a Note document in MongoDB.
 *
 * Key Mongoose concepts used here:
 *  - Schema validation (required, maxlength)
 *  - Default values
 *  - timestamps option (auto-adds createdAt, updatedAt)
 *  - Pre-save middleware (hook that runs before every .save())
 *
 * Interview tip: MongoDB is schema-less, but Mongoose adds schemas on the
 * application layer. This gives us validation without losing MongoDB's flexibility.
 */

const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a title'],
      trim: true, // Removes leading/trailing whitespace automatically
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },

    content: {
      type: String,
      required: [true, 'Please provide content'],
    },

    // Only set when the note was created by uploading a .md file
    fileName: {
      type: String,
      default: null,
    },

    // Array of strings — each tag is lowercased and trimmed automatically
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],

    // Auto-calculated by the pre-save hook below — never set manually
    wordCount: {
      type: Number,
      default: 0,
    },
  },
  {
    // timestamps: true automatically adds:
    //   createdAt — set once when document is first created
    //   updatedAt — updated every time the document is saved
    timestamps: true,
  }
);

// ── Pre-save Middleware ───────────────────────────────────────────────────────
/**
 * This hook runs BEFORE every document.save() call.
 * We strip Markdown syntax to count only real words (not # * ` etc.)
 *
 * Interview tip: Pre-save hooks are great for derived fields (like wordCount)
 * because the calculation happens automatically — the caller never needs to
 * remember to do it.
 */
noteSchema.pre('save', function (next) {
  const plainText = this.content
    .replace(/```[\s\S]*?```/g, '')       // Remove fenced code blocks
    .replace(/`[^`]*`/g, '')              // Remove inline code
    .replace(/#{1,6}\s?/g, '')            // Remove heading markers (#, ##, ###...)
    .replace(/(\*\*|__)(.*?)\1/g, '$2')  // Remove bold markers, keep text
    .replace(/(\*|_)(.*?)\1/g, '$2')     // Remove italic markers, keep text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Links: keep link text, remove URL
    .replace(/!\[[^\]]*\]\([^)]+\)/g, '')    // Remove image syntax entirely
    .replace(/^[>*+\-]\s+/gm, '')        // Remove blockquote & list markers
    .trim();

  // Split on whitespace and filter out empty strings
  this.wordCount = plainText.split(/\s+/).filter((w) => w.length > 0).length;

  next(); // Always call next() in middleware, or the save will hang forever
});

// mongoose.model() creates a Model class from the schema.
// 'Note' → MongoDB collection will be named 'notes' (auto-pluralised + lowercased)
module.exports = mongoose.model('Note', noteSchema);
