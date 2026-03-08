'use strict';

/**
 * Seed a default owner user if one does not exist.
 * NOTE: As requested, this always seeds an owner with PIN 0000 when missing.
 * PIN is hashed + salted using the same utils as the app.
 */

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
}

const { Pool } = require('pg');
const { hashPin } = require('../src/utils/pin');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

async function run() {
  const client = await pool.connect();
  try {
    const { rows } = await client.query("SELECT id FROM users WHERE role='owner' LIMIT 1");
    if (rows.length > 0) {
      console.log('Owner already exists; skipping seed.');
      return;
    }

    const { salt, hash } = hashPin('0000');

    const insert = await client.query(
      "INSERT INTO users (role, name, pin_hash, pin_salt) VALUES ('owner', $1, $2, $3) RETURNING id",
      ['Owner', hash, salt]
    );

    console.log(`Seeded owner user (id=${insert.rows[0].id}) with default PIN 0000.`);
  } finally {
    client.release();
    await pool.end();
  }
}

run().catch((err) => {
  console.error('Seed error:', err.message);
  process.exit(1);
});
