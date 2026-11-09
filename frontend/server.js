const express = require('express');
const path = require('path');
const fs = require('fs');
const initSqlJs = require('sql.js');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_PATH = path.join(__dirname, 'tasks.db');

// Middleware
app.use(express.json());
app.use(express.static(__dirname));

let db = null;
let SQL = null;

// Initialize database
async function initDatabase() {
  SQL = await initSqlJs();
  
  // Load existing database or create new one
  if (fs.existsSync(DB_PATH)) {
    const filebuffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(filebuffer);
  } else {
    db = new SQL.Database();
  }
  
  // Create tasks table if it doesn't exist
  db.run(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      completed INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  saveDatabase();
}

// Save database to file
function saveDatabase() {
  try {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_PATH, buffer);
  } catch (error) {
    console.error('Error saving database:', error);
  }
}

// API Routes

// GET all tasks
app.get('/api/tasks', (req, res) => {
  try {
    const stmt = db.prepare('SELECT * FROM tasks ORDER BY created_at DESC');
    const tasks = [];
    while (stmt.step()) {
      const row = stmt.getAsObject();
      tasks.push(row);
    }
    stmt.free();
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST create a new task
app.post('/api/tasks', (req, res) => {
  try {
    const { title } = req.body;
    
    if (!title || title.trim() === '') {
      return res.status(400).json({ error: 'Title is required' });
    }
    
    db.run('INSERT INTO tasks (title, completed) VALUES (?, ?)', [title.trim(), 0]);
    saveDatabase();
    
    // Get the newly created task
    const stmt = db.prepare('SELECT * FROM tasks ORDER BY id DESC LIMIT 1');
    stmt.step();
    const newTask = stmt.getAsObject();
    stmt.free();
    
    res.status(201).json(newTask);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update task (mark as complete/incomplete)
app.put('/api/tasks/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { completed } = req.body;
    
    // Check if task exists
    const checkStmt = db.prepare('SELECT * FROM tasks WHERE id = ?');
    checkStmt.bind([parseInt(id)]);
    const exists = checkStmt.step();
    checkStmt.free();
    
    if (!exists) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    db.run('UPDATE tasks SET completed = ? WHERE id = ?', [completed ? 1 : 0, parseInt(id)]);
    saveDatabase();
    
    // Get updated task
    const stmt = db.prepare('SELECT * FROM tasks WHERE id = ?');
    stmt.bind([parseInt(id)]);
    stmt.step();
    const updatedTask = stmt.getAsObject();
    stmt.free();
    
    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE a task
app.delete('/api/tasks/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if task exists
    const checkStmt = db.prepare('SELECT * FROM tasks WHERE id = ?');
    checkStmt.bind([parseInt(id)]);
    const exists = checkStmt.step();
    checkStmt.free();
    
    if (!exists) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    db.run('DELETE FROM tasks WHERE id = ?', [parseInt(id)]);
    saveDatabase();
    
    res.json({ message: 'Task deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start server
async function start() {
  try {
    await initDatabase();
    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
      console.log('Database initialized at', DB_PATH);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();
