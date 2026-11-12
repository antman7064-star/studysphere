# StudySphere

StudySphere is a responsive study-planning site with a task tracker backed by
an Express REST API and SQLite database.

## Run locally

1. Install Node.js.
2. Install dependencies with `npm install`.
3. Start the server with `npm start`.
4. Open [http://localhost:3000](http://localhost:3000).

The server creates `database/tasks.db` automatically. SQLite database files,
the `database/` folder, and `node_modules/` are ignored by Git.

## API

- `GET /api/health` checks that the API is available.
- `GET /api/tasks` lists saved tasks.
- `POST /api/tasks` creates a task with a title of up to 200 characters.
- `PUT /api/tasks/:id` updates a task's `completed` boolean.
- `DELETE /api/tasks/:id` deletes a task.

## Project structure

```text
index.html
README.md
package.json
package-lock.json
server.js
.gitignore
css/
  styles.css
js/
  main.js
assets/
  images/
  icons/
database/       created by the server; not committed
node_modules/   created by npm; not committed
```
