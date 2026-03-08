# Lux Angels Cleaning — Management System

A full-stack cleaning company management system built for Luxembourg-based cleaning businesses.

## 🌐 Live App
- **Frontend:** https://luxangelsyamyamyam.onrender.com
- **API:** https://luxangelsyamyam-api.onrender.com

## 🏗️ Project Structure
```
/
├── frontend/          # React + Vite frontend
├── backend/           # Node.js + Express API
├── render.yaml        # Render deployment config
└── README.md
```

> Note: Root-level `App.jsx` and `text_fixed.jsx` are legacy draft files — ignore them.

## 🔑 Default Login Credentials
| Role | PIN |
|---|---|
| Owner | `1234` |
| Cleaner (default) | `0000` |

## 🚀 Local Development

### Frontend
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

### Backend
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your DATABASE_URL
node app.js
```

## 🗄️ Database Setup
Run the schema against your PostgreSQL database:
```bash
psql $DATABASE_URL -f backend/schema.sql
```

## 🚢 Deploy on Render
1. Push to `main` branch
2. Render auto-deploys frontend static site
3. For backend: create a new Web Service on Render:
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `node app.js`
   - Add env var: `DATABASE_URL` (from your Render Postgres Internal URL)
4. Run `schema.sql` via Render's PSQL command

## 📊 Tech Stack
| Layer | Tech |
|---|---|
| Frontend | React 18, Vite, localStorage |
| Backend | Node.js, Express |
| Database | PostgreSQL 18 |
| Hosting | Render.com |
| Excel I/O | SheetJS (xlsx) |

