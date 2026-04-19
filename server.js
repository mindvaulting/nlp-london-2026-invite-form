const express = require('express');
const Database = require('better-sqlite3');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// --- Database setup ---
const db = new Database(path.join(__dirname, 'submissions.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS submissions (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    your_name  TEXT,
    your_phone TEXT NOT NULL,
    your_email TEXT NOT NULL,
    friend1_name  TEXT, friend1_phone TEXT, friend1_email TEXT,
    friend2_name  TEXT, friend2_phone TEXT, friend2_email TEXT,
    friend3_name  TEXT, friend3_phone TEXT, friend3_email TEXT,
    friend4_name  TEXT, friend4_phone TEXT, friend4_email TEXT,
    friend5_name  TEXT, friend5_phone TEXT, friend5_email TEXT
  )
`);

const insertSubmission = db.prepare(`
  INSERT INTO submissions (
    your_name, your_phone, your_email,
    friend1_name, friend1_phone, friend1_email,
    friend2_name, friend2_phone, friend2_email,
    friend3_name, friend3_phone, friend3_email,
    friend4_name, friend4_phone, friend4_email,
    friend5_name, friend5_phone, friend5_email
  ) VALUES (
    @your_name, @your_phone, @your_email,
    @friend1_name, @friend1_phone, @friend1_email,
    @friend2_name, @friend2_phone, @friend2_email,
    @friend3_name, @friend3_phone, @friend3_email,
    @friend4_name, @friend4_phone, @friend4_email,
    @friend5_name, @friend5_phone, @friend5_email
  )
`);

// --- Middleware ---
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// --- Routes ---

// Submit form
app.post('/submit', (req, res) => {
  const {
    yourName, yourPhone, yourEmail,
    friend1_name, friend1_phone, friend1_email,
    friend2_name, friend2_phone, friend2_email,
    friend3_name, friend3_phone, friend3_email,
    friend4_name, friend4_phone, friend4_email,
    friend5_name, friend5_phone, friend5_email,
  } = req.body;

  if (!yourPhone || !yourEmail) {
    return res.status(400).json({ error: 'Phone and email are required.' });
  }

  if (!friend1_name) {
    return res.status(400).json({ error: 'Friend #1 name is required.' });
  }

  try {
    const result = insertSubmission.run({
      your_name:  yourName  || null,
      your_phone: yourPhone,
      your_email: yourEmail,
      friend1_name:  friend1_name  || null, friend1_phone: friend1_phone || null, friend1_email: friend1_email || null,
      friend2_name:  friend2_name  || null, friend2_phone: friend2_phone || null, friend2_email: friend2_email || null,
      friend3_name:  friend3_name  || null, friend3_phone: friend3_phone || null, friend3_email: friend3_email || null,
      friend4_name:  friend4_name  || null, friend4_phone: friend4_phone || null, friend4_email: friend4_email || null,
      friend5_name:  friend5_name  || null, friend5_phone: friend5_phone || null, friend5_email: friend5_email || null,
    });

    res.json({ success: true, id: result.lastInsertRowid });
  } catch (err) {
    console.error('DB error:', err);
    res.status(500).json({ error: 'Failed to save submission.' });
  }
});

// View all submissions (simple admin view)
app.get('/submissions', (req, res) => {
  const rows = db.prepare('SELECT * FROM submissions ORDER BY created_at DESC').all();
  res.json(rows);
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
