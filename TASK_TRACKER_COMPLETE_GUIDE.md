# StudySphere Task Tracker Lab - Complete Implementation Guide

## Lab Completion Checklist

### Part 1: Before You Begin ✓
- [x] GitHub account and access to repository
- [x] VS Code and GitHub Codespaces access
- [x] Project contains index.html, css/styles.css, js/script.js
- [x] Node.js (v24.22.1) confirmed
- [x] Existing front-end preserved

### Part 2: Initialize Node.js & Install Dependencies ✓
- [x] Run `npm init -y`
- [x] Install Express: `npm install express`
- [x] Install sql.js: `npm install sql.js`
- [x] Install nodemon (dev): `npm install --save-dev nodemon`
- [x] package.json configured with start and dev scripts
- [x] node_modules excluded from git (.gitignore)

### Part 3: Create Task Tracker Database & REST API ✓

#### Database Schema
```sql
CREATE TABLE tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  completed INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

#### Server Implementation (server.js) ✓
- [x] Express server listening on port 3000
- [x] Middleware configured: express.json() and express.static()
- [x] SQL.js database initialized and persisted to tasks.db
- [x] All 4 CRUD endpoints implemented

#### API Endpoints Implemented ✓

1. **GET /api/tasks** - Retrieve all tasks
   - Returns: 200 OK with array of tasks
   - Ordered by created_at DESC (newest first)

2. **POST /api/tasks** - Create new task
   - Request: { title: "Task title" }
   - Returns: 201 Created with new task object
   - Validation: Rejects empty titles with 400 Bad Request

3. **PUT /api/tasks/:id** - Update task (mark complete/incomplete)
   - Request: { completed: true/false }
   - Returns: 200 OK with updated task
   - Validation: Returns 404 if task doesn't exist

4. **DELETE /api/tasks/:id** - Delete task
   - Returns: 200 OK with success message
   - Validation: Returns 404 if task doesn't exist

### Part 4: Build Frontend UI ✓

#### HTML Structure (index.html)
- [x] Task input field with label and placeholder
- [x] "Add Task" button
- [x] Task list container (unordered list)
- [x] Empty state message
- [x] Semantic HTML with accessibility features

#### CSS Styling (css/task-tracker.css) ✓
- [x] Modern design with gradient background
- [x] Task list items with flexbox layout
- [x] Checkbox for completion toggle
- [x] Delete button for each task
- [x] Hover effects for interactivity
- [x] Completed state with strikethrough text
- [x] Responsive design for mobile devices
- [x] Professional color scheme (purple/blue gradient)

#### JavaScript (js/task-tracker.js) ✓
- [x] TaskTracker class for encapsulation
- [x] Async/await for API calls using fetch()
- [x] Safe DOM manipulation (textContent only)
- [x] Event listeners for button clicks
- [x] Enter key support for adding tasks
- [x] Confirmation dialog for deletion
- [x] Error handling and user feedback
- [x] Auto-load tasks on page load
- [x] Real-time UI updates

### Part 5: Test API Behavior ✓

#### Status Code Testing ✓
- [x] 200 OK: GET /api/tasks ✓
- [x] 200 OK: PUT /api/tasks/:id ✓
- [x] 200 OK: DELETE /api/tasks/:id ✓
- [x] 201 Created: POST /api/tasks ✓
- [x] 400 Bad Request: POST /api/tasks (empty title) ✓
- [x] 404 Not Found: DELETE /api/tasks/:id (invalid id) ✓

#### CRUD Operations Testing ✓
- [x] Create tasks with different titles
- [x] View all tasks in list
- [x] Mark tasks as complete (strikethrough appears)
- [x] Mark tasks as incomplete (strikethrough removed)
- [x] Delete tasks from list
- [x] Empty message shows when no tasks exist

### Part 6: Data Persistence ✓
- [x] Tasks persist in SQLite database
- [x] Database file created at frontend/tasks.db
- [x] All changes saved to disk immediately
- [x] Data loads correctly on server restart
- [x] Timestamps recorded for each task

### Part 7: Security Features ✓

#### SQL Injection Prevention ✓
- [x] Parameterized queries used (? placeholders)
- [x] No string concatenation for SQL queries
- [x] Input validation on server side
- [x] All user input treated as data, not code

#### Safe DOM Updates ✓
- [x] textContent used instead of innerHTML
- [x] No XSS vulnerability in task display
- [x] User input displayed safely
- [x] Event listeners on elements, not on strings

---

## Reflection Questions & Answers

### Question 1: How does the REST API organize communication between the browser and the server?

The REST API uses standard HTTP methods to perform specific actions on resources (tasks). Each HTTP method has a clear purpose: GET retrieves data, POST creates new data, PUT updates existing data, and DELETE removes data. Each endpoint follows the pattern `/api/tasks` or `/api/tasks/:id`, making it predictable and organized. The browser uses the fetch() function to send requests to these endpoints, receiving JSON responses that the JavaScript code processes and displays to the user. This separation of concerns makes the code maintainable—the server handles data, the browser handles presentation.

### Question 2: Why are SQL placeholders (?) important in this application, and what could happen without them?

SQL placeholders (the `?` symbols) prevent SQL injection attacks. When we use placeholders, the database treats everything after the `?` as pure data, not as SQL code. Without placeholders, a malicious user could enter SQL commands in the title field (like `'); DROP TABLE tasks; --`) that would be executed by the database, potentially destroying all data. The placeholders ensure that user input remains data and cannot be interpreted as commands, protecting the application from this critical security vulnerability.

### Question 3: What is the difference between textContent and innerHTML when displaying user-provided task titles?

textContent updates only the visible text of an HTML element, treating the input as plain text. innerHTML parses the input as HTML code, which means a malicious user could insert `<script>` tags or other HTML that would execute. If we used innerHTML to display task titles, someone could add a task like `<img src=x onerror="alert('hacked')">` and that script would run. Using textContent is the safe choice because it prevents this XSS (Cross-Site Scripting) vulnerability by ensuring user input is always treated as text, never as code.

### Question 4: How does data persist after a server restart, and why is this important?

When a task is added, the server saves it to a SQLite database file called tasks.db on disk. When the server restarts, the server.js code checks if tasks.db exists; if it does, the data is loaded back into memory. This persistence is critical because users expect their data to be saved. Without persistence, refreshing the page or restarting the server would lose all tasks. In a real application, this trust is essential—imagine if your to-do list disappeared every time you closed the app!

### Question 5: How could the Task Tracker be adapted for a different type of application (e.g., a travel planner or fitness tracker)?

The core structure would remain the same because the backend CRUD operations are universal. For a travel planner, the "task" table could be renamed to "destinations" with fields like location, dates, visited (instead of completed), and notes. For a fitness tracker, it could become "workouts" with fields like exercise, duration, calories_burned, and date. The REST API endpoints, database architecture, and UI logic are reusable; only the labels, styling, and database schema would change. This modularity is why REST APIs are so powerful—they can serve many different applications with minimal changes.

---

## Technical Implementation Details

### Security Best Practices Implemented

1. **Input Validation**
   - Empty titles rejected at server level
   - Titles trimmed to remove leading/trailing whitespace
   - Completed flag validated as boolean

2. **SQL Injection Prevention**
   - All database queries use parameterized statements
   - sql.js bind() method ensures proper escaping
   - No string concatenation in SQL commands

3. **XSS Prevention**
   - All DOM updates use textContent (safe text insertion)
   - No innerHTML or eval() anywhere in codebase
   - Event listeners prevent inline script execution

4. **HTTP Status Codes**
   - 200 OK: Successful read/update/delete
   - 201 Created: Successful task creation
   - 400 Bad Request: Invalid input
   - 404 Not Found: Resource doesn't exist
   - 500 Server Error: Unexpected server issues

### Database Architecture

**Schema:**
```sql
CREATE TABLE tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,  -- Unique identifier
  title TEXT NOT NULL,                    -- Task description
  completed INTEGER DEFAULT 0,            -- 0=incomplete, 1=complete
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP  -- Creation time
)
```

**Persistence:**
- sql.js exports database to binary format
- Binary data written to tasks.db file
- File loaded on server startup
- All changes immediately saved after each operation

### Performance Considerations

1. **Database Queries**: All queries are optimized
   - SELECT * filtered and ordered efficiently
   - No N+1 query problems
   - Single database round-trip per operation

2. **Frontend Optimization**
   - Entire task list reloaded after each operation (simple approach)
   - No complex state management needed for this project size
   - Fetch requests are asynchronous (no UI blocking)

3. **Error Recovery**
   - If API call fails, user sees error message
   - Deletion confirmation prevents accidental loss
   - Page can be refreshed to reload data

### File Structure

```
frontend/
├── server.js                 # Express server with API endpoints
├── index.html               # Main HTML with Task Tracker UI
├── package.json             # Dependencies
├── css/
│   ├── style.css           # Original styling
│   └── task-tracker.css    # Task Tracker styling
├── js/
│   ├── script.js           # Original JavaScript
│   └── task-tracker.js     # Task Tracker client code
├── assets/
│   ├── images/
│   └── icons/
└── tasks.db                # SQLite database (created on first run)
```

### How to Extend This Project

1. **User Authentication**: Add login/registration and user-specific task lists
2. **Due Dates**: Add deadline tracking and reminders
3. **Categories**: Organize tasks by project or category
4. **Priority Levels**: Mark tasks as high/medium/low priority
5. **Database**: Upgrade to persistent database (PostgreSQL, MySQL)
6. **Cloud Deployment**: Host on Heroku, AWS, or similar
7. **Mobile App**: Create React Native or Flutter app using same API
8. **Analytics**: Track completed tasks over time

---

## Conclusion

This Task Tracker implementation demonstrates a complete full-stack web application with:
- Proper separation of concerns (frontend/backend)
- RESTful API design following best practices
- Database persistence and integrity
- Security best practices to prevent attacks
- User-friendly, responsive interface
- Clean, maintainable code

The project is production-ready and serves as an excellent foundation for more complex applications.

---

**Submission Date:** 2026-11-09  
**Status:** COMPLETE ✓  
**All Requirements Met:** YES ✓
