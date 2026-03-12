# LAC Lux angels cleaning Management System

A full-stack cleaning business management app built with **React (Vite)** + **Node.js/Express** + **PostgreSQL**.

---

## Project Structure

```
Luxangelsyamyam/
├── frontend/          ← React 18 + Vite SPA (all pages in src/App.jsx)
│   ├── src/
│   │   ├── App.jsx    ← Main application component
│   │   └── main.jsx
│   ├── package.json
│   ├── vite.config.js
│   └── .env.example
├── backend/           ← Express API + PostgreSQL
│   ├── app.js         ← All REST route implementations
│   ├── db.js          ← PostgreSQL connection pool
│   ├── schema.sql     ← Database schema + seed data
│   ├── package.json
│   └── .env.example
├── README.md
├── App.jsx            ← ⚠️  Legacy draft — ignore, use frontend/src/App.jsx
└── text_fixed.jsx     ← ⚠️  Legacy draft — ignore, use frontend/src/App.jsx
```

> **Note:** The root-level `App.jsx` and `text_fixed.jsx` files are old draft copies left over from early development.  
> The canonical source is **`frontend/src/App.jsx`**. The root files can be safely ignored.

---

## Tech Stack

| Layer     | Technology                              |
|-----------|-----------------------------------------|
| Frontend  | React 18, Vite, ExcelJS                 |
| Backend   | Node.js, Express 4, cors, dotenv        |
| Database  | PostgreSQL 14+ (via `pg` pool)          |
| Auth      | PIN-only (no JWT, no sessions)          |
| Export    | Excel (.xlsx) via SheetJS               |

---

## Default PIN Credentials

| Role   | Default PIN |
|--------|-------------|
| Owner  | `1234`      |
| Cleaner| `0000`      |

These can be changed from the Settings page (owner) or by the owner via the employee PIN management screen.

---

## Database Setup

1. Create a PostgreSQL database:
   ```sql
   CREATE DATABASE luxangels;
   ```

2. Run the schema (creates all tables + seeds default settings):
   ```bash
   psql -d luxangels -f backend/schema.sql
   ```

3. (Optional) Verify DB/API connectivity:
   ```bash
   curl http://localhost:5000/api/health/db
   ```

4. To fully reset database schema + users (owner/manager credentials), run:
   ```bash
   cd backend
   npm run reset:db
   ```

   You can override credentials at runtime:
   ```bash
   RESET_OWNER_PIN=9999 RESET_MANAGER_USERNAME=owner RESET_MANAGER_PIN=1111 npm run reset:db
   ```

---

## Installation

### Backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env: set DATABASE_URL to your PostgreSQL connection string
node app.js
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
# Edit .env: set VITE_API_BASE_URL if backend runs on a non-default port
npm run dev
```

---

## Environment Variables

### `backend/.env`

| Variable       | Description                                      | Default                                            |
|----------------|--------------------------------------------------|----------------------------------------------------|
| `DATABASE_URL` | PostgreSQL connection string (**required**)      | `postgresql://user:password@localhost:5432/luxangels` |
| `PORT`         | Port the API server listens on                   | `5000`                                             |
| `EMAIL_PROVIDER` | Email provider (`zeptomail` or `resend`)      | _(auto-detect from keys)_                          |
| `ZEPTO_API_TOKEN`| Zoho ZeptoMail API token (if using ZeptoMail)  | _(empty)_                                          |
| `ZEPTO_API_URL`  | ZeptoMail API URL                               | `https://api.zeptomail.eu/v1.1/email`              |
| `ZEPTO_FROM_ADDRESS` | Default sender email for ZeptoMail         | _(empty)_                                          |
| `RESEND_API_KEY` | Resend API key (if using Resend)               | _(empty)_                                          |
| `RESEND_FROM`    | Default sender email for Resend                | _(empty)_                                          |

### `frontend/.env`

| Variable             | Description                    | Default                  |
|----------------------|--------------------------------|--------------------------|
| `VITE_API_BASE_URL`  | Base URL for the backend API   | `http://localhost:5000`  |

---

## API Endpoints

| Method | Path                        | Description                  |
|--------|-----------------------------|------------------------------|
| GET    | `/api/health/db`            | DB connectivity health check  |
| POST   | `/api/auth/pin-login`       | PIN login (owner or cleaner) |
| GET    | `/api/employees`            | List all employees           |
| POST   | `/api/employees`            | Create employee              |
| PUT    | `/api/employees/:id`        | Update employee              |
| DELETE | `/api/employees/:id`        | Delete employee              |
| PUT    | `/api/employees/:id/pin`    | Update employee PIN          |
| GET    | `/api/clients`              | List all clients             |
| POST   | `/api/clients`              | Create client                |
| PUT    | `/api/clients/:id`          | Update client                |
| DELETE | `/api/clients/:id`          | Delete client                |
| GET    | `/api/schedules`            | List all schedules           |
| POST   | `/api/schedules`            | Create schedule              |
| PUT    | `/api/schedules/:id`        | Update schedule              |
| DELETE | `/api/schedules/:id`        | Delete schedule              |
| GET    | `/api/clock-entries`        | List clock entries           |
| POST   | `/api/clock-entries`        | Clock in                     |
| PUT    | `/api/clock-entries/:id`    | Clock out                    |
| GET    | `/api/invoices`             | List all invoices            |
| POST   | `/api/invoices`             | Create invoice               |
| PUT    | `/api/invoices/:id`         | Update invoice               |
| DELETE | `/api/invoices/:id`         | Delete invoice               |
| GET    | `/api/payslips`             | List all payslips            |
| POST   | `/api/payslips`             | Create payslip               |
| PUT    | `/api/payslips/:id`         | Update payslip               |
| GET    | `/api/settings`             | Get all settings             |
| PUT    | `/api/settings`             | Bulk update settings         |
| POST   | `/api/notifications/email`  | Send email directly from platform via configured provider |
