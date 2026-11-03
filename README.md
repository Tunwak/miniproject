# Mini Backend + Database Project

A simple full-stack mini project that demonstrates:

- Node.js + Express.js backend
- MongoDB and MySQL support
- JWT authentication flow
- REST API design
- Next.js frontend integration

## Stack

- Backend: Express + JWT + bcrypt + MongoDB + MySQL
- Frontend: Next.js
- Database: MongoDB or MySQL (switch by environment)

## Project structure

- `apps/backend` - API server
- `apps/web` - Next.js app

## 1) Install dependencies

```bash
npm install
```

## 2) Start backend

Create `apps/backend/.env`:

```env
PORT=5000
JWT_SECRET=supersecretkey
DB_TYPE=mongo
MONGO_URI=mongodb://localhost:27017/mini_db
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=123456
MYSQL_DATABASE=mini_db
```

Then run:

```bash
npm run dev:backend
```

## 3) Start frontend

Create `apps/web/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

Then run:

```bash
npm run dev:web
```

## API endpoints

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`

### Tasks

- `GET /api/tasks`
- `POST /api/tasks`
- `DELETE /api/tasks/:id`

### Example payloads

Register:

```json
{
  "name": "Alice",
  "email": "alice@example.com",
  "password": "123456"
}
```

Login:

```json
{
  "email": "alice@example.com",
  "password": "123456"
}
```

Task:

```json
{
  "title": "Build API",
  "description": "Create a REST API for tasks"
}
```

## DB behavior

Set `DB_TYPE` to:

- `mongo` for MongoDB
- `mysql` for MySQL

The backend automatically connects to the correct database and creates the required collections/tables.

## Notes

This project is intentionally simple and designed for learning the flow of:

- backend setup
- database integration
- authentication
- REST API design
- full-stack app connection
