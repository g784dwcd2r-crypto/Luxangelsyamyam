'use strict';

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const config = require('./config');
const { errorHandler } = require('./middleware/error');
const { isHealthy } = require('./db');

const authRoutes = require('./routes/auth');
const employeeRoutes = require('./routes/employees');

const app = express();

// Security headers
app.use(helmet());

// CORS
app.use(
  cors({
    origin: config.corsOrigin,
    credentials: true,
  })
);

// Request logging (skip in test env)
if (config.nodeEnv !== 'test') {
  app.use(morgan(config.nodeEnv === 'production' ? 'combined' : 'dev'));
}

// Body parsing
app.use(express.json());

// ── Routes ────────────────────────────────────────────────

/**
 * GET /api/health
 */
app.get('/api/health', async (req, res) => {
  const dbOk = await isHealthy();
  res.status(dbOk ? 200 : 503).json({ ok: dbOk, db: dbOk ? 'connected' : 'unavailable' });
});

app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Centralized error handler (must be last)
app.use(errorHandler);

module.exports = app;
