require('dotenv').config();
const fs = require('fs');
const path = require('path');
const pool = require('../db');

const ownerPin = process.env.RESET_OWNER_PIN || '1234';
const managerPin = process.env.RESET_MANAGER_PIN || '4321';
const managerUsername = process.env.RESET_MANAGER_USERNAME || 'manager';

async function resetDatabase() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not configured. Add it to backend/.env before running reset.');
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    await client.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');

    const schemaPath = path.join(__dirname, '..', 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    await client.query(schemaSql);

    await client.query(
      `UPDATE settings
       SET value = CASE
         WHEN key = 'ownerPin' THEN $1
         WHEN key = 'managerPin' THEN $2
         WHEN key = 'managerUsername' THEN $3
         ELSE value
       END
       WHERE key IN ('ownerPin', 'managerPin', 'managerUsername')`,
      [ownerPin, managerPin, managerUsername]
    );

    await client.query(
      `INSERT INTO employees (id, name, email, role, status, pin)
       VALUES ('EMP001', 'Default Cleaner', 'cleaner@luxangelscleaning.lu', 'Cleaner', 'active', '0000')`
    );

    await client.query('COMMIT');
    console.log('Database reset completed successfully.');
    console.log(`Owner login -> role: owner, pin: ${ownerPin}`);
    console.log(`Manager login -> role: manager, employeeId: ${managerUsername}, pin: ${managerPin}`);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Database reset failed:', err.message);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

resetDatabase();
