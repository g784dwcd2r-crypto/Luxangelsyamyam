'use strict';

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const config = {
  port: parseInt(process.env.PORT, 10) || 5000,
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '8h',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  nodeEnv: process.env.NODE_ENV || 'development',
};

if (!config.databaseUrl) {
  console.warn('WARNING: DATABASE_URL is not set. Database features will not work.');
}

if (!config.jwtSecret) {
  console.warn('WARNING: JWT_SECRET is not set. Authentication will not work.');
}

module.exports = config;
