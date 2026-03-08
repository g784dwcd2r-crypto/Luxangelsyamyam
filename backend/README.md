# LuxAngels Backend

Express + PostgreSQL + JWT API for the LuxAngels Cleaning Management System.

---

## Prerequisites

- Node.js 18+
- PostgreSQL 14+

---

## Environment Configuration

Copy the example env file and fill in your values:

```bash
cp .env.example .env
```

| Variable        | Description                               | Default                   |
|-----------------|-------------------------------------------|---------------------------|
| `PORT`          | HTTP port the server listens on           | `5000`                    |
| `DATABASE_URL`  | PostgreSQL connection string              | _required_                |
| `JWT_SECRET`    | Secret used to sign JWTs (keep private)   | _required_                |
| `JWT_EXPIRES_IN`| JWT lifetime (e.g. `8h`, `1d`)           | `8h`                      |
| `CORS_ORIGIN`   | Allowed CORS origin for the frontend      | `http://localhost:5173`   |
| `NODE_ENV`      | `development` \| `production` \| `test`  | `development`             |

---

## Install Dependencies

```bash
cd backend
npm install
```

---

## Run Migrations

Migrations live under `backend/migrations/` as plain `.sql` files.  
The runner tracks which files have already been applied via a `migrations` table.

```bash
npm run migrate
```

---

## Run the Server

**Development** (auto-restarts on file changes):

```bash
npm run dev
```

**Production:**

```bash
npm start
```

---

## API Endpoints

### Health

```
GET /api/health
```

Response:

```json
{ "ok": true, "db": "connected" }
```

---

### Auth

#### PIN Login

```
POST /api/auth/pin-login
Content-Type: application/json

{
  "role": "owner",
  "pin": "1234"
}
```

Employee login (requires `employeeId`):

```
POST /api/auth/pin-login
Content-Type: application/json

{
  "role": "employee",
  "pin": "5678",
  "employeeId": "uuid-of-employee"
}
```

Response:

```json
{
  "token": "<jwt>",
  "user": { "id": "...", "role": "owner", "name": "Alice" }
}
```

---

### Employees (owner only)

All employee endpoints require the `Authorization: Bearer <token>` header.

#### Create Employee

```bash
curl -X POST http://localhost:5000/api/employees \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <owner-token>" \
  -d '{ "name": "Bob", "pin": "4321" }'
```

Response `201`:

```json
{
  "employee": { "id": "...", "role": "employee", "name": "Bob", "created_at": "..." }
}
```

#### List Employees

```bash
curl http://localhost:5000/api/employees \
  -H "Authorization: Bearer <owner-token>"
```

#### Reset Employee PIN (owner)

```bash
curl -X PUT http://localhost:5000/api/employees/<id>/pin \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <owner-token>" \
  -d '{ "newPin": "9999" }'
```

#### Change Own PIN (employee)

```bash
curl -X PUT http://localhost:5000/api/employees/<id>/pin \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <employee-token>" \
  -d '{ "newPin": "9999", "oldPin": "5678" }'
```

---

## Project Structure

```
backend/
├── migrations/          # Plain SQL migration files
│   └── 001_create_users.sql
├── scripts/
│   └── migrate.js       # Migration runner
├── src/
│   ├── config.js        # Env-var configuration
│   ├── app.js           # Express app (middleware + routes)
│   ├── server.js        # Server entry point
│   ├── db/
│   │   └── index.js     # Postgres pool + query helper
│   ├── middleware/
│   │   ├── auth.js      # JWT verification + role guard
│   │   └── error.js     # Centralized error handler
│   ├── routes/
│   │   ├── auth.js      # POST /api/auth/pin-login
│   │   └── employees.js # Employee CRUD
│   └── utils/
│       └── pin.js       # hashPin / verifyPin (scrypt)
├── app.js               # Thin compatibility entrypoint
├── .env.example
├── .gitignore
└── package.json
```

---

## Notes

- PINs are **never stored in plain text**. They are hashed using Node's built-in `crypto.scryptSync`.
- JWTs include `sub` (user ID), `role`, and `name` claims.
- Protected endpoints respond with `401` when the token is missing/invalid and `403` when the role is insufficient.
