# 📝 Markdown Notes App

A full-stack **MERN** application for creating, uploading, grammar-checking, and rendering Markdown notes as HTML.

---

## 📸 What It Does

| Feature | Description |
|---|---|
| ✍️ Write Markdown | Live Write / Preview tabs in a split-pane editor |
| 📂 Upload `.md` files | Drag-and-drop or click-to-upload any Markdown file |
| ✅ Grammar Check | Detects passive voice, weasel words, adverbs, and more |
| 💾 Save Notes | Stored in MongoDB with tags, word count, and timestamps |
| 🌐 Render to HTML | Server-side Markdown → HTML conversion with `marked` |
| 🗑️ Delete Notes | Remove notes from the sidebar list |
| 📱 Fully Responsive | Works on mobile, tablet, and desktop |

---

## 🏗️ Architecture

```
┌──────────────────────────┐          ┌─────────────────────────────┐
│   React Frontend          │ ◄──────► │   Express API (Node.js)     │
│   Vite  |  Port 5173     │  REST    │   Port 5000                 │
└──────────────────────────┘  JSON    └──────────┬──────────────────┘
                                                  │
                               ┌──────────────────┼──────────────────┐
                               │                  │                  │
                    ┌──────────▼───┐   ┌───────────▼──┐   ┌─────────▼───────┐
                    │  MongoDB     │   │    marked     │   │   write-good    │
                    │  Atlas (DB)  │   │  (Markdown    │   │  (Grammar NLP)  │
                    └──────────────┘   │  → HTML)      │   └─────────────────┘
                                       └───────────────┘
```

### Why This Architecture?

- **Separation of concerns** — Frontend handles UI; Backend handles business logic and data
- **Stateless REST API** — Every request contains all needed information; easy to scale
- **MongoDB** — Schema-flexible; perfect for notes that may have different fields over time
- **Vite proxy** — In dev, `/api` requests are forwarded to Express, avoiding CORS issues entirely

---

## 📁 Folder Structure

```
markdown-notes-app/
├── backend/
│   ├── config/
│   │   └── db.js              # MongoDB connection
│   ├── controllers/
│   │   └── noteController.js  # All 8 route handlers
│   ├── middleware/
│   │   └── upload.js          # Multer file upload config
│   ├── models/
│   │   └── Note.js            # Mongoose schema + pre-save hook
│   ├── routes/
│   │   └── noteRoutes.js      # Express Router
│   ├── .env.example           # Copy → .env
│   ├── package.json
│   └── server.js              # App entry point
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Editor.jsx      # Markdown editor (Write/Preview)
│   │   │   ├── GrammarPanel.jsx # Floating grammar results drawer
│   │   │   ├── Navbar.jsx      # Fixed top navigation
│   │   │   └── NoteList.jsx    # Sidebar with search + delete
│   │   ├── pages/
│   │   │   ├── Home.jsx        # Main layout (sidebar + editor)
│   │   │   └── NoteDetail.jsx  # Full rendered note view
│   │   ├── services/
│   │   │   └── api.js          # Axios instance + all API calls
│   │   ├── App.jsx             # Routes setup
│   │   ├── index.css           # Global styles + design tokens
│   │   └── main.jsx            # React entry point
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── .gitignore
└── README.md
```

---

## 🚀 Local Setup (Step by Step)

### Prerequisites

- Node.js ≥ 18
- A free [MongoDB Atlas](https://cloud.mongodb.com) account

### 1. Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/markdown-notes-app.git
cd markdown-notes-app
```

### 2. Set up the Backend

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env`:

```
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://<user>:<pass>@cluster0.mongodb.net/notesdb?retryWrites=true&w=majority
FRONTEND_URL=http://localhost:5173
```

Start the server:

```bash
npm run dev        # uses nodemon — auto-restarts on file changes
```

You'll see: `✅ MongoDB connected` and `🚀 Server running on port 5000`

### 3. Set up the Frontend

Open a **new terminal**:

```bash
cd frontend
npm install
cp .env.example .env
# Leave VITE_API_URL empty in development
```

Start Vite:

```bash
npm run dev
```

Open `http://localhost:5173` in your browser. 🎉

---

## 🔌 API Reference

Base URL (dev): `http://localhost:5000/api`

| Method | Endpoint | Description | Body / Params |
|---|---|---|---|
| `GET` | `/notes` | List all notes (no content) | — |
| `GET` | `/notes/:id` | Get one note with full content | — |
| `GET` | `/notes/:id/render` | Get note as rendered HTML | — |
| `POST` | `/notes` | Create note from JSON | `{ title, content, tags? }` |
| `POST` | `/notes/upload` | Upload a `.md` file | `multipart/form-data` (field: `mdFile`) |
| `POST` | `/notes/grammar-check` | Grammar check text | `{ text }` |
| `PUT` | `/notes/:id` | Update a note | `{ title?, content?, tags? }` |
| `DELETE` | `/notes/:id` | Delete a note | — |

### Example Responses

**`POST /api/notes`**

```json
{
  "success": true,
  "data": {
    "_id": "665f1a2b3c4d5e6f7a8b9c0d",
    "title": "My First Note",
    "content": "# Hello\n\nThis is **markdown**.",
    "tags": ["work", "ideas"],
    "wordCount": 4,
    "createdAt": "2024-06-01T10:00:00.000Z"
  }
}
```

**`POST /api/notes/grammar-check`**

```json
{
  "success": true,
  "data": {
    "score": 78,
    "wordCount": 52,
    "issueCount": 3,
    "suggestions": [
      {
        "index": 12,
        "offset": 5,
        "reason": "\"was given\" may be passive voice",
        "type": "passive-voice"
      }
    ]
  }
}
```

---

## 🌍 Deployment

### Backend → Render (Free)

1. Push code to GitHub
2. Create a new **Web Service** on [render.com](https://render.com)
3. Settings:
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `npm start`
4. Add environment variables in Render dashboard:
   ```
   MONGO_URI=mongodb+srv://...
   FRONTEND_URL=https://your-frontend.vercel.app
   NODE_ENV=production
   ```

### Frontend → Vercel (Free)

1. Create a new project on [vercel.com](https://vercel.com)
2. Settings:
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`
3. Add environment variable:
   ```
   VITE_API_URL=https://your-backend.onrender.com/api
   ```

> **First deploy tip:** Render free tier spins down after 15 min of inactivity. First request may take ~30 seconds to wake up.

---

## 🛠️ Tech Stack Explained Simply

### Backend

| Package | What it does | Why we used it |
|---|---|---|
| **Express** | Web framework for Node.js | Industry standard, minimal, flexible |
| **Mongoose** | MongoDB object modeling | Gives us schemas, validation, and queries |
| **marked** | Markdown → HTML parser | Fast, GFM-compliant, widely used |
| **write-good** | English grammar linter | Catches passive voice, weak words, adverbs |
| **multer** | File upload middleware | Handles `multipart/form-data` for `.md` files |
| **cors** | Cross-Origin policy | Lets the React app talk to our API |
| **dotenv** | Environment variables | Keeps secrets out of code |

### Frontend

| Package | What it does | Why we used it |
|---|---|---|
| **React** | UI library | Component-based, industry standard |
| **Vite** | Build tool + dev server | 10× faster than Create React App |
| **React Router** | Client-side routing | SPA navigation without page reloads |
| **Axios** | HTTP client | Cleaner than fetch(), auto JSON parsing |
| **marked** | Markdown → HTML (client) | Live preview in the editor tab |

---

## 💡 Key Concepts Explained (For Interviews)

### 1. How does file upload work?

```
Browser (FormData) → Multer middleware → buffer.toString('utf-8') → MongoDB
```

We use `multer` with `memoryStorage` — this means the file is **never written to disk**. It lives in RAM as a `Buffer` and we convert it to a string immediately. This is ideal for cloud platforms (Render, Heroku) where the filesystem is ephemeral.

```javascript
// middleware/upload.js
const storage = multer.memoryStorage(); // no disk writes
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    // Only allow .md files
    if (file.originalname.match(/\.(md|markdown)$/i)) cb(null, true);
    else cb(new Error('Only .md files allowed'));
  },
  limits: { fileSize: 5 * 1024 * 1024 } // 5 MB limit
});
```

### 2. How does Markdown rendering work?

```
Markdown string → marked.parse() → HTML string → stored in DB response
```

`marked` is a Markdown parser. We pass it raw Markdown text and it returns an HTML string. We do this **server-side** on the `/render` endpoint so the client just receives ready-to-display HTML. We also do it **client-side** in the Editor's Preview tab using the same library.

```javascript
import { marked } from 'marked';
marked.setOptions({ gfm: true }); // GitHub Flavored Markdown
const html = marked.parse('# Hello **world**');
// → "<h1>Hello <strong>world</strong></h1>"
```

### 3. How does grammar checking work?

```
Raw text → strip Markdown syntax → write-good → categorize issues → calculate score
```

`write-good` analyzes English prose. Before checking, we strip all Markdown syntax (headers `#`, bold `**`, code ticks, etc.) so it only reads the actual words. The score is `100 - (issues / words × 200)` — more issues per word = lower score.

```javascript
import writeGood from 'write-good';
const suggestions = writeGood('The task was completed by the team.'); 
// → [{ index: 9, offset: 14, reason: '"was completed" is passive voice' }]
```

### 4. How does the Mongoose pre-save hook work?

```javascript
// Before every save, calculate wordCount automatically
NoteSchema.pre('save', function(next) {
  const plain = this.content.replace(/[#*`_\[\]]/g, ''); // strip markdown
  this.wordCount = plain.trim().split(/\s+/).filter(Boolean).length;
  next();
});
```

This is a **Mongoose middleware** (like Express middleware but for DB operations). It runs automatically before every `.save()`. We use it to compute `wordCount` as a **derived field** — we never manually set it.

### 5. Why does the route order matter?

```javascript
// routes/noteRoutes.js
router.post('/grammar-check', checkGrammar); // ← specific routes FIRST
router.post('/upload', upload.single('mdFile'), uploadNote);
router.route('/:id').get(getNoteById).put(updateNote).delete(deleteNote);
```

Express matches routes **top to bottom**. If `/:id` was first, Express would try to match `grammar-check` and `upload` as note IDs and fail. Specific routes always go before parameterized ones.

### 6. What is CORS and why do we need it?

CORS = Cross-Origin Resource Sharing. Browsers block requests from `localhost:5173` to `localhost:5000` by default (different ports = different origins). We use the `cors` package to tell the browser "yes, this origin is allowed."

```javascript
app.use(cors({ origin: process.env.FRONTEND_URL }));
```

In production, only our Vercel URL is whitelisted — nobody else can call our API from their frontend.

### 7. What is the Vite proxy and why is it useful?

```javascript
// vite.config.js
server: {
  proxy: {
    '/api': { target: 'http://localhost:5000', changeOrigin: true }
  }
}
```

In development, any request to `/api/...` from the React app is **silently forwarded** to `http://localhost:5000/api/...` by Vite's dev server. This means no CORS errors in development, and our `api.js` service file uses just `/api` (relative URLs) that work in both dev and prod.

### 8. What is `dangerouslySetInnerHTML` and is it safe here?

React blocks injecting raw HTML by default (XSS protection). `dangerouslySetInnerHTML={{ __html: html }}` explicitly opts in. In our app, the HTML comes from our own `marked.parse()` call on **user-entered content** — there's no untrusted third-party HTML. For a production app, you'd add `DOMPurify` to sanitize before rendering.

---

## 📊 Data Model

```javascript
// models/Note.js
{
  title:     String,  // required, trimmed
  content:   String,  // raw Markdown
  fileName:  String,  // original .md filename (if uploaded)
  tags:      [String],
  wordCount: Number,  // auto-calculated by pre-save hook
  createdAt: Date,    // auto by timestamps:true
  updatedAt: Date     // auto by timestamps:true
}
```

---

## 🔐 Security Measures

- **File type validation** — Only `.md`/`.markdown` files accepted by Multer
- **File size limit** — 5 MB max
- **Payload limit** — `express.json({ limit: '1mb' })`
- **CORS whitelist** — Only the known frontend origin
- **No `eval()`** — Markdown rendering is safe string transformation
- **Environment variables** — MongoDB URI and secrets never in code

---

## 📱 Responsive Breakpoints

| Width | Layout |
|---|---|
| > 768px | Sidebar (270px) + Editor side by side |
| ≤ 768px | Sidebar collapses to top strip (220px tall), Editor below |
| ≤ 480px | Smaller fonts, stacked action buttons |

---

## 🤔 What I Learned / Would Improve

- **Learned:** Multer `memoryStorage` pattern, Mongoose pre-save hooks, grammar NLP with write-good
- **Would add:** DOMPurify for XSS protection, pagination for large note lists, dark mode, real-time collaborative editing with Socket.io, JWT authentication

---

## 👨‍💻 Author

Built with ❤️ using the MERN stack.
