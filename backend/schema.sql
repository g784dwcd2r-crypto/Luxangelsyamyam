-- Lux Angels Cleaning Management System — PostgreSQL Schema

CREATE TABLE IF NOT EXISTS employees (
  id               TEXT PRIMARY KEY,
  name             TEXT NOT NULL,
  email            TEXT,
  phone            TEXT,
  phone_mobile     TEXT,
  role             TEXT NOT NULL DEFAULT 'Cleaner',
  hourly_rate      NUMERIC(10,2) NOT NULL DEFAULT 15,
  address          TEXT,
  city             TEXT,
  postal_code      TEXT,
  country          TEXT DEFAULT 'Luxembourg',
  start_date       DATE,
  status           TEXT NOT NULL DEFAULT 'active',
  contract_type    TEXT DEFAULT 'CDI',
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
  notes            TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
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
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS schedules (
  id          TEXT PRIMARY KEY,
  date        DATE NOT NULL,
  client_id   TEXT REFERENCES clients(id) ON DELETE SET NULL,
  employee_id TEXT REFERENCES employees(id) ON DELETE SET NULL,
  start_time  TEXT NOT NULL DEFAULT '08:00',
  end_time    TEXT NOT NULL DEFAULT '12:00',
  status      TEXT NOT NULL DEFAULT 'scheduled',
  notes       TEXT,
  recurrence  TEXT DEFAULT 'none',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
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
  total_hours     NUMERIC(8,2) NOT NULL DEFAULT 0,
  hourly_rate     NUMERIC(10,2) NOT NULL DEFAULT 0,
  gross_pay       NUMERIC(10,2) NOT NULL DEFAULT 0,
  social_charges  NUMERIC(10,2) NOT NULL DEFAULT 0,
  tax_estimate    NUMERIC(10,2) NOT NULL DEFAULT 0,
  net_pay         NUMERIC(10,2) NOT NULL DEFAULT 0,
  status          TEXT NOT NULL DEFAULT 'draft',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS settings (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
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
  ('ownerPin',       'LuxAngels@2025'),
  ('managerUsername','manager'),
  ('managerPin',     'Manager@2025')
ON CONFLICT (key) DO NOTHING;
