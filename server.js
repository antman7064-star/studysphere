const express = require('express');
const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

const databaseFolder = path.join(__dirname, 'database');
fs.mkdirSync(databaseFolder, { recursive: true });

const database = new Database(path.join(databaseFolder, 'tasks.db'));
database.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    completed INTEGER NOT NULL DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )
`);

const PUBLIC_FOLDERS = ['css', 'js', 'assets'];

PUBLIC_FOLDERS.forEach((folder) => {
  app.use(`/${folder}`, express.static(path.join(__dirname, folder)));
});

app.use((req, res, next) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') return next();

  const match = req.path.match(/^\/([A-Za-z0-9_-]*)(\.html)?$/);
  if (!match) return next();

  const pageFile = path.join(__dirname, `${match[1] || 'index'}.html`);
  if (!fs.existsSync(pageFile)) return next();

  res.sendFile(pageFile);
});

app.get('/api/health', (req, res) => {
  res.json({ message: 'Task API is working!' });
});

app.get('/api/tasks', (req, res) => {
  const tasks = database.prepare('SELECT * FROM tasks ORDER BY id DESC').all();
  res.json(tasks.map((task) => ({
    ...task,
    completed: Boolean(task.completed)
  })));
});

app.post('/api/tasks', (req, res) => {
  const { title } = req.body || {};

  if (typeof title !== 'string' || !title.trim()) {
    return res.status(400).json({ error: 'A task title is required.' });
  }

  const trimmedTitle = title.trim();
  if (trimmedTitle.length > 200) {
    return res.status(400).json({ error: 'A task title must be 200 characters or fewer.' });
  }

  const result = database.prepare('INSERT INTO tasks (title) VALUES (?)').run(trimmedTitle);
  const newTask = database.prepare('SELECT * FROM tasks WHERE id = ?').get(result.lastInsertRowid);

  res.status(201).json({
    ...newTask,
    completed: Boolean(newTask.completed)
  });
});

app.put('/api/tasks/:id', (req, res) => {
  const id = Number(req.params.id);
  const { completed } = req.body || {};

  if (!Number.isInteger(id) || id < 1) {
    return res.status(400).json({ error: 'Invalid task ID.' });
  }

  if (typeof completed !== 'boolean') {
    return res.status(400).json({ error: 'Completed must be true or false.' });
  }

  const result = database.prepare('UPDATE tasks SET completed = ? WHERE id = ?').run(
    completed ? 1 : 0,
    id
  );

  if (result.changes === 0) {
    return res.status(404).json({ error: 'Task not found.' });
  }

  const updatedTask = database.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
  res.json({
    ...updatedTask,
    completed: Boolean(updatedTask.completed)
  });
});

app.delete('/api/tasks/:id', (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id < 1) {
    return res.status(400).json({ error: 'Invalid task ID.' });
  }

  const result = database.prepare('DELETE FROM tasks WHERE id = ?').run(id);
  if (result.changes === 0) {
    return res.status(404).json({ error: 'Task not found.' });
  }

  res.json({ message: 'Task deleted successfully.' });
});

app.use((req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API route not found.' });
  }
  res.status(404).send('Page not found.');
});

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});

server.on('error', (error) => {
  console.error('Could not start the server:', error.message);
  process.exitCode = 1;
});
