# Lux Angels Cleaning Management System

## Installation

### Frontend
1. Navigate to the `frontend` directory.
2. Install dependencies with `npm install`.
3. Run the frontend application using `npm run dev`.

### Backend
1. Navigate to the `backend` directory.
2. Install dependencies with `npm install`.
3. Run the backend application using `node app.js`.

## Environment Variables

Make sure to create a `.env` file in both frontend and backend directories.

- **Frontend**:
  - `VITE_API_BASE_URL`: The base URL for the API

- **Backend**:
  - `DATABASE_URL`: Your PostgreSQL database URL (do not commit the actual secret).

## Note
This project uses a PIN-only authentication system for users.
