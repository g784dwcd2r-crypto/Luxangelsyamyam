const { Pool } = require('pg');
require('dotenv').config();

const connectionString = String(process.env.DATABASE_URL || '').trim();
const useSsl = /^true$/i.test(String(process.env.PGSSLMODE || '')) || /render\.com/i.test(connectionString);

const pool = new Pool({
  connectionString,
  ssl: useSsl ? { rejectUnauthorized: false } : undefined,
  max: Number(process.env.PG_POOL_MAX || 10),
  idleTimeoutMillis: Number(process.env.PG_IDLE_TIMEOUT_MS || 30000),
  connectionTimeoutMillis: Number(process.env.PG_CONNECT_TIMEOUT_MS || 10000),
  keepAlive: true,
});

pool.on('error', (err) => {
  console.error('Unexpected PostgreSQL pool error:', err);
});

module.exports = pool;
