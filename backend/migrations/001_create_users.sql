-- Migration: 001_create_users
-- Creates the users table that holds both owner and employee accounts.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS users (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  role        TEXT        NOT NULL CHECK (role IN ('owner', 'employee')),
  name        TEXT        NOT NULL,
  pin_hash    TEXT        NOT NULL,
  pin_salt    TEXT        NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Only one owner is allowed
CREATE UNIQUE INDEX IF NOT EXISTS users_owner_unique
  ON users (role)
  WHERE role = 'owner';
