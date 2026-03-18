-- Lux Angels Cleaning Management System — PostgreSQL Schema

CREATE TABLE IF NOT EXISTS employees (
  id               TEXT PRIMARY KEY,
  name             TEXT NOT NULL,
  email            TEXT,
  phone            TEXT,
  phone_mobile     TEXT,
  role             TEXT NOT NULL DEFAULT 'Cleaner',
  hourly_rate      NUMERIC(10,2) NOT NULL DEFAULT 15,
  weekly_hours     NUMERIC(10,2) DEFAULT 0,
  address          TEXT,
  city             TEXT,
  postal_code      TEXT,
  country          TEXT DEFAULT 'Luxembourg',
  start_date       DATE,
  status           TEXT NOT NULL DEFAULT 'active',
  contract_type    TEXT DEFAULT 'CDI',
  contract_end_date DATE,
  bank_iban        TEXT,
  social_sec_number TEXT,
  date_of_birth    DATE,
  nationality      TEXT,
  languages        TEXT,
  transport        TEXT,
  work_permit      TEXT,
  emergency_name   TEXT,
  emergency_phone  TEXT,
  pin              TEXT NOT NULL DEFAULT '0000',
  username         TEXT DEFAULT '',
  password_hash    TEXT,
  email_verified   BOOLEAN NOT NULL DEFAULT FALSE,
  account_status   TEXT NOT NULL DEFAULT 'approved',
  notes            TEXT,
  profile_picture  TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


CREATE TABLE IF NOT EXISTS account_requests (
  id                       TEXT PRIMARY KEY,
  name                     TEXT NOT NULL,
  email                    TEXT NOT NULL UNIQUE,
  password_hash            TEXT NOT NULL,
  verification_token_hash  TEXT NOT NULL,
  verification_expires_at  TIMESTAMPTZ NOT NULL,
  email_verified           BOOLEAN NOT NULL DEFAULT FALSE,
  approval_status          TEXT NOT NULL DEFAULT 'pending_verification',
  rejection_reason         TEXT,
  decided_at               TIMESTAMPTZ,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS clients (
  id                   TEXT PRIMARY KEY,
  name                 TEXT NOT NULL,
  contact_person       TEXT,
  email                TEXT,
  phone                TEXT,
  phone_mobile         TEXT,
  address              TEXT,
  apartment_floor      TEXT,
  city                 TEXT,
  postal_code          TEXT,
  country              TEXT DEFAULT 'Luxembourg',
  type                 TEXT DEFAULT 'Residential',
  cleaning_frequency   TEXT DEFAULT 'Weekly',
  billing_type         TEXT DEFAULT 'hourly',
  price_per_hour       NUMERIC(10,2) DEFAULT 35,
  price_fixed          NUMERIC(10,2) DEFAULT 0,
  status               TEXT NOT NULL DEFAULT 'active',
  language             TEXT DEFAULT 'FR',
  access_code          TEXT,
  key_location         TEXT,
  parking_info         TEXT,
  pet_info             TEXT,
  preferred_day        TEXT,
  preferred_time       TEXT,
  contract_start       DATE,
  contract_end         DATE,
  square_meters        NUMERIC(10,2),
  tax_id               TEXT,
  special_instructions TEXT,
  notes                TEXT,
  meta                 JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS schedules (
  id             TEXT PRIMARY KEY,
  date           DATE NOT NULL,
  client_id      TEXT REFERENCES clients(id) ON DELETE SET NULL,
  employee_id    TEXT REFERENCES employees(id) ON DELETE SET NULL,
  start_time     TEXT NOT NULL DEFAULT '08:00',
  end_time       TEXT NOT NULL DEFAULT '12:00',
  status         TEXT NOT NULL DEFAULT 'scheduled',
  payment_status TEXT NOT NULL DEFAULT 'unpaid',
  notes          TEXT,
  recurrence     TEXT DEFAULT 'none',
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS clock_entries (
  id          TEXT PRIMARY KEY,
  employee_id TEXT REFERENCES employees(id) ON DELETE SET NULL,
  client_id   TEXT REFERENCES clients(id) ON DELETE SET NULL,
  clock_in    TIMESTAMPTZ NOT NULL,
  clock_out   TIMESTAMPTZ,
  notes       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS invoices (
  id             TEXT PRIMARY KEY,
  invoice_number TEXT NOT NULL UNIQUE,
  date           DATE NOT NULL,
  due_date       DATE,
  client_id      TEXT REFERENCES clients(id) ON DELETE SET NULL,
  status         TEXT NOT NULL DEFAULT 'draft',
  items          JSONB NOT NULL DEFAULT '[]',
  subtotal       NUMERIC(10,2) NOT NULL DEFAULT 0,
  vat_rate       NUMERIC(5,2) NOT NULL DEFAULT 17,
  vat_amount     NUMERIC(10,2) NOT NULL DEFAULT 0,
  total          NUMERIC(10,2) NOT NULL DEFAULT 0,
  notes          TEXT,
  payment_terms  TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS payslips (
  id              TEXT PRIMARY KEY,
  payslip_number  TEXT NOT NULL UNIQUE,
  employee_id     TEXT REFERENCES employees(id) ON DELETE SET NULL,
  month           TEXT NOT NULL,
  period_start    DATE,
  period_end      DATE,
  total_hours     NUMERIC(8,2) NOT NULL DEFAULT 0,
  hourly_rate     NUMERIC(10,2) NOT NULL DEFAULT 0,
  gross_pay       NUMERIC(10,2) NOT NULL DEFAULT 0,
  social_charges  NUMERIC(10,2) NOT NULL DEFAULT 0,
  tax_estimate    NUMERIC(10,2) NOT NULL DEFAULT 0,
  net_pay         NUMERIC(10,2) NOT NULL DEFAULT 0,
  hour_breakdown  JSONB NOT NULL DEFAULT '[]',
  status          TEXT NOT NULL DEFAULT 'draft',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS settings (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS quotes (
  id             TEXT PRIMARY KEY,
  quote_number   TEXT NOT NULL UNIQUE,
  date           DATE NOT NULL,
  client_id      TEXT REFERENCES clients(id) ON DELETE SET NULL,
  status         TEXT NOT NULL DEFAULT 'draft',
  items          JSONB NOT NULL DEFAULT '[]',
  subtotal       NUMERIC(10,2) NOT NULL DEFAULT 0,
  vat_rate       NUMERIC(5,2) NOT NULL DEFAULT 17,
  vat_amount     NUMERIC(10,2) NOT NULL DEFAULT 0,
  total          NUMERIC(10,2) NOT NULL DEFAULT 0,
  notes          TEXT,
  pricing_mode   TEXT DEFAULT 'hours',
  job_schedule   JSONB DEFAULT '{}',
  visible_columns JSONB DEFAULT '{}',
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS photo_uploads (
  id             TEXT PRIMARY KEY,
  employee_id    TEXT REFERENCES employees(id) ON DELETE SET NULL,
  client_id      TEXT REFERENCES clients(id) ON DELETE SET NULL,
  clock_entry_id TEXT,
  file_name      TEXT,
  image_data     TEXT,
  note           TEXT,
  type           TEXT DEFAULT 'issue',
  seen_by_owner  BOOLEAN NOT NULL DEFAULT FALSE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS time_off_requests (
  id             TEXT PRIMARY KEY,
  employee_id    TEXT REFERENCES employees(id) ON DELETE SET NULL,
  start_date     DATE NOT NULL,
  end_date       DATE NOT NULL,
  requested_days NUMERIC(6,2) NOT NULL DEFAULT 1,
  reason         TEXT,
  leave_type     TEXT DEFAULT 'conge',
  status         TEXT NOT NULL DEFAULT 'pending',
  reviewed_at    TIMESTAMPTZ,
  reviewed_by    TEXT,
  review_note    TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS inventory_products (
  id        TEXT PRIMARY KEY,
  name      TEXT NOT NULL,
  unit      TEXT DEFAULT 'bottles',
  stock     NUMERIC(10,2) NOT NULL DEFAULT 0,
  min_stock NUMERIC(10,2) NOT NULL DEFAULT 0,
  note      TEXT,
  active    BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS product_requests (
  id           TEXT PRIMARY KEY,
  employee_id  TEXT REFERENCES employees(id) ON DELETE SET NULL,
  product_id   TEXT REFERENCES inventory_products(id) ON DELETE SET NULL,
  quantity     NUMERIC(10,2) NOT NULL DEFAULT 1,
  note         TEXT,
  delivery_at  TEXT,
  status       TEXT NOT NULL DEFAULT 'pending',
  approved_qty NUMERIC(10,2) DEFAULT 0,
  delivered_qty NUMERIC(10,2) DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cleaner_product_holdings (
  id          TEXT PRIMARY KEY,
  employee_id TEXT REFERENCES employees(id) ON DELETE SET NULL,
  product_id  TEXT REFERENCES inventory_products(id) ON DELETE SET NULL,
  qty_in_hand NUMERIC(10,2) NOT NULL DEFAULT 0,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS prospect_visits (
  id          TEXT PRIMARY KEY,
  client_id   TEXT REFERENCES clients(id) ON DELETE SET NULL,
  visit_date  DATE NOT NULL,
  visit_time  TEXT,
  address     TEXT,
  notes       TEXT,
  status      TEXT NOT NULL DEFAULT 'planned',
  photos      JSONB DEFAULT '[]',
  updated_at  TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS expenses (
  id         TEXT PRIMARY KEY,
  name       TEXT NOT NULL,
  amount     NUMERIC(10,2) NOT NULL DEFAULT 0,
  due_day    INTEGER NOT NULL DEFAULT 1,
  frequency  TEXT NOT NULL DEFAULT 'monthly',
  start_date DATE,
  end_date   DATE,
  category   TEXT DEFAULT 'other',
  note       TEXT,
  is_active  BOOLEAN NOT NULL DEFAULT TRUE,
  payments   JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for frequently-queried foreign keys and filter columns
CREATE INDEX IF NOT EXISTS idx_schedules_employee_id  ON schedules(employee_id);
CREATE INDEX IF NOT EXISTS idx_schedules_client_id    ON schedules(client_id);
CREATE INDEX IF NOT EXISTS idx_schedules_date         ON schedules(date);
CREATE INDEX IF NOT EXISTS idx_clock_entries_employee ON clock_entries(employee_id);
CREATE INDEX IF NOT EXISTS idx_clock_entries_client   ON clock_entries(client_id);
CREATE INDEX IF NOT EXISTS idx_clock_entries_clock_in ON clock_entries(clock_in DESC);
CREATE INDEX IF NOT EXISTS idx_invoices_client_id     ON invoices(client_id);
CREATE INDEX IF NOT EXISTS idx_invoices_date          ON invoices(date DESC);
CREATE INDEX IF NOT EXISTS idx_payslips_employee_id   ON payslips(employee_id);
CREATE INDEX IF NOT EXISTS idx_employees_status       ON employees(status);
CREATE INDEX IF NOT EXISTS idx_employees_email        ON employees(LOWER(email));
CREATE INDEX IF NOT EXISTS idx_employees_name         ON employees(LOWER(name));
CREATE UNIQUE INDEX IF NOT EXISTS idx_employees_email_unique ON employees(LOWER(email));
CREATE INDEX IF NOT EXISTS idx_account_requests_status ON account_requests(approval_status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_quotes_client_id ON quotes(client_id);
CREATE INDEX IF NOT EXISTS idx_quotes_date ON quotes(date DESC);
CREATE INDEX IF NOT EXISTS idx_photo_uploads_employee ON photo_uploads(employee_id);
CREATE INDEX IF NOT EXISTS idx_photo_uploads_seen ON photo_uploads(seen_by_owner);
CREATE INDEX IF NOT EXISTS idx_time_off_requests_employee ON time_off_requests(employee_id);
CREATE INDEX IF NOT EXISTS idx_time_off_requests_status ON time_off_requests(status);
CREATE INDEX IF NOT EXISTS idx_product_requests_employee ON product_requests(employee_id);
CREATE INDEX IF NOT EXISTS idx_product_requests_status ON product_requests(status);
CREATE INDEX IF NOT EXISTS idx_cleaner_holdings_employee ON cleaner_product_holdings(employee_id);
CREATE INDEX IF NOT EXISTS idx_prospect_visits_client ON prospect_visits(client_id);
CREATE INDEX IF NOT EXISTS idx_prospect_visits_date ON prospect_visits(visit_date DESC);

-- Migration: add profile_picture column if it doesn't exist (for existing databases)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='employees' AND column_name='profile_picture') THEN
    ALTER TABLE employees ADD COLUMN profile_picture TEXT;
  END IF;
END $$;

-- Migration: add lang and theme preference columns to employees
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='employees' AND column_name='lang') THEN
    ALTER TABLE employees ADD COLUMN lang TEXT NOT NULL DEFAULT 'fr';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='employees' AND column_name='theme') THEN
    ALTER TABLE employees ADD COLUMN theme TEXT NOT NULL DEFAULT 'dark';
  END IF;
END $$;

-- Migration: add geolocation columns to clients (GPS pin for the property)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='clients' AND column_name='location_lat') THEN
    ALTER TABLE clients ADD COLUMN location_lat NUMERIC(10,7);
    ALTER TABLE clients ADD COLUMN location_lng NUMERIC(10,7);
  END IF;
END $$;

-- Migration: add geolocation columns to clock_entries (check-in / check-out GPS)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='clock_entries' AND column_name='checkin_lat') THEN
    ALTER TABLE clock_entries ADD COLUMN checkin_lat  NUMERIC(10,7);
    ALTER TABLE clock_entries ADD COLUMN checkin_lng  NUMERIC(10,7);
    ALTER TABLE clock_entries ADD COLUMN checkin_accuracy NUMERIC(8,2);
    ALTER TABLE clock_entries ADD COLUMN checkout_lat NUMERIC(10,7);
    ALTER TABLE clock_entries ADD COLUMN checkout_lng NUMERIC(10,7);
    ALTER TABLE clock_entries ADD COLUMN checkout_accuracy NUMERIC(8,2);
  END IF;
END $$;

-- Migration: enrich payslips with selected range and detailed hour audit lines
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='payslips' AND column_name='period_start') THEN
    ALTER TABLE payslips ADD COLUMN period_start DATE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='payslips' AND column_name='period_end') THEN
    ALTER TABLE payslips ADD COLUMN period_end DATE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='payslips' AND column_name='hour_breakdown') THEN
    ALTER TABLE payslips ADD COLUMN hour_breakdown JSONB NOT NULL DEFAULT '[]';
  END IF;
END $$;

-- Seed default settings
INSERT INTO settings (key, value) VALUES
  ('companyName',    'Lux Angels Cleaning'),
  ('companyAddress', '12 Rue de la Liberté, L-1930 Luxembourg'),
  ('companyEmail',   'info@luxangels.lu'),
  ('companyPhone',   '+352 123 456'),
  ('vatNumber',      'LU12345678'),
  ('bankIban',       'LU12 3456 7890 1234 5678'),
  ('defaultVatRate', '17'),
  ('ownerUsername',  'LuxAdmin'),
  ('ownerEmail',     'owner@luxangels.lu'),
  ('ownerPin',       'LuxAngels@2025'),
  ('managerUsername','manager'),
  ('managerPin',     'Manager@2025'),
  ('owner_lang',     'fr'),
  ('owner_theme',    'dark'),
  ('manager_lang',   'fr'),
  ('manager_theme',  'dark')
ON CONFLICT (key) DO NOTHING;
