# Sever (Node.js + MySQL)

This project is a minimal Node.js server that connects to MySQL using `mysql2` and provides simple `/users` API endpoints.

## Setup

1. Copy `.env.example` to `.env` and fill your MySQL credentials.
   ```
   cp .env.example .env
   ```
2. Install dependencies:
   ```
   npm install
   ```
3. Initialize database (run the SQL in `init.sql` using your MySQL client):
   ```
   mysql -u root -p < init.sql
   ```
   or run the commands inside a MySQL shell.

4. Start the server in development mode:
   ```
   npm run dev
   ```

5. API endpoints:
   - `GET /` => health check
   - `GET /users` => list users
   - `POST /users` => create user (JSON body: `{ "name": "...", "email": "..." }`)

## Notes
- The project uses ES modules (`type: "module"` in package.json).
- Use `nodemon` for auto-restart during development.
