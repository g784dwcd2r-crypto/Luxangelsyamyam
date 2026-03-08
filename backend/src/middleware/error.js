'use strict';

/**
 * Centralized error-handling middleware.
 * Must be registered last (after all routes).
 */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal server error';

  if (status >= 500) {
    console.error('Unhandled error:', err);
  }

  res.status(status).json({ error: message });
}

module.exports = { errorHandler };
