require('dotenv').config();
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const pool = require('./db');

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(bodyParser.json());

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false
});
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false
});
app.use('/api/', apiLimiter);
app.use('/api/auth/', authLimiter);

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// ── Auth ──────────────────────────────────────────────────────────────────────

app.post('/api/auth/pin-login', async (req, res) => {
  const { role, pin, employeeId } = req.body;
  try {
    if (role === 'owner') {
      const result = await pool.query("SELECT value FROM settings WHERE key = 'ownerPin'");
      const ownerPin = result.rows[0]?.value;
      if (pin === ownerPin) return res.json({ success: true, role: 'owner' });
      return res.status(401).json({ success: false, error: 'Invalid PIN' });
    }
    if (role === 'cleaner') {
      const result = await pool.query('SELECT pin FROM employees WHERE id = $1', [employeeId]);
      if (!result.rows.length) return res.status(401).json({ success: false, error: 'Employee not found' });
      if (pin === result.rows[0].pin) return res.json({ success: true, role: 'cleaner', employeeId });
      return res.status(401).json({ success: false, error: 'Invalid PIN' });
    }
    return res.status(400).json({ success: false, error: 'Invalid role' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Employees ─────────────────────────────────────────────────────────────────

app.get('/api/employees', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM employees ORDER BY name');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/employees', async (req, res) => {
  const {
    id, name, email, phone, phone_mobile, role, hourly_rate, address, city,
    postal_code, country, start_date, status, contract_type, bank_iban,
    social_sec_number, date_of_birth, nationality, languages, transport,
    work_permit, emergency_name, emergency_phone, pin, notes
  } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO employees (id, name, email, phone, phone_mobile, role, hourly_rate, address, city,
        postal_code, country, start_date, status, contract_type, bank_iban, social_sec_number,
        date_of_birth, nationality, languages, transport, work_permit, emergency_name,
        emergency_phone, pin, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25)
       RETURNING *`,
      [id, name, email, phone, phone_mobile, role, hourly_rate, address, city,
       postal_code, country, start_date, status, contract_type, bank_iban,
       social_sec_number, date_of_birth, nationality, languages, transport,
       work_permit, emergency_name, emergency_phone, pin ?? '0000', notes]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/employees/:id', async (req, res) => {
  const {
    name, email, phone, phone_mobile, role, hourly_rate, address, city,
    postal_code, country, start_date, status, contract_type, bank_iban,
    social_sec_number, date_of_birth, nationality, languages, transport,
    work_permit, emergency_name, emergency_phone, pin, notes
  } = req.body;
  try {
    const result = await pool.query(
      `UPDATE employees SET name=$1, email=$2, phone=$3, phone_mobile=$4, role=$5, hourly_rate=$6,
        address=$7, city=$8, postal_code=$9, country=$10, start_date=$11, status=$12,
        contract_type=$13, bank_iban=$14, social_sec_number=$15, date_of_birth=$16,
        nationality=$17, languages=$18, transport=$19, work_permit=$20, emergency_name=$21,
        emergency_phone=$22, pin=$23, notes=$24
       WHERE id=$25 RETURNING *`,
      [name, email, phone, phone_mobile, role, hourly_rate, address, city,
       postal_code, country, start_date, status, contract_type, bank_iban,
       social_sec_number, date_of_birth, nationality, languages, transport,
       work_permit, emergency_name, emergency_phone, pin, notes, req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/employees/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM employees WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/employees/:id/pin', async (req, res) => {
  const { pin } = req.body;
  try {
    const result = await pool.query(
      'UPDATE employees SET pin = $1 WHERE id = $2 RETURNING *',
      [pin, req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Clients ───────────────────────────────────────────────────────────────────

app.get('/api/clients', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM clients ORDER BY name');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/clients', async (req, res) => {
  const {
    id, name, contact_person, email, phone, phone_mobile, address, apartment_floor,
    city, postal_code, country, type, cleaning_frequency, billing_type, price_per_hour,
    price_fixed, status, language, access_code, key_location, parking_info, pet_info,
    preferred_day, preferred_time, contract_start, contract_end, square_meters,
    tax_id, special_instructions, notes
  } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO clients (id, name, contact_person, email, phone, phone_mobile, address,
        apartment_floor, city, postal_code, country, type, cleaning_frequency, billing_type,
        price_per_hour, price_fixed, status, language, access_code, key_location, parking_info,
        pet_info, preferred_day, preferred_time, contract_start, contract_end, square_meters,
        tax_id, special_instructions, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29,$30)
       RETURNING *`,
      [id, name, contact_person, email, phone, phone_mobile, address, apartment_floor,
       city, postal_code, country, type, cleaning_frequency, billing_type, price_per_hour,
       price_fixed, status, language, access_code, key_location, parking_info, pet_info,
       preferred_day, preferred_time, contract_start, contract_end, square_meters,
       tax_id, special_instructions, notes]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/clients/:id', async (req, res) => {
  const {
    name, contact_person, email, phone, phone_mobile, address, apartment_floor,
    city, postal_code, country, type, cleaning_frequency, billing_type, price_per_hour,
    price_fixed, status, language, access_code, key_location, parking_info, pet_info,
    preferred_day, preferred_time, contract_start, contract_end, square_meters,
    tax_id, special_instructions, notes
  } = req.body;
  try {
    const result = await pool.query(
      `UPDATE clients SET name=$1, contact_person=$2, email=$3, phone=$4, phone_mobile=$5,
        address=$6, apartment_floor=$7, city=$8, postal_code=$9, country=$10, type=$11,
        cleaning_frequency=$12, billing_type=$13, price_per_hour=$14, price_fixed=$15,
        status=$16, language=$17, access_code=$18, key_location=$19, parking_info=$20,
        pet_info=$21, preferred_day=$22, preferred_time=$23, contract_start=$24,
        contract_end=$25, square_meters=$26, tax_id=$27, special_instructions=$28, notes=$29
       WHERE id=$30 RETURNING *`,
      [name, contact_person, email, phone, phone_mobile, address, apartment_floor,
       city, postal_code, country, type, cleaning_frequency, billing_type, price_per_hour,
       price_fixed, status, language, access_code, key_location, parking_info, pet_info,
       preferred_day, preferred_time, contract_start, contract_end, square_meters,
       tax_id, special_instructions, notes, req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/clients/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM clients WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Schedules ─────────────────────────────────────────────────────────────────

app.get('/api/schedules', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM schedules ORDER BY date DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/schedules', async (req, res) => {
  const { id, date, client_id, employee_id, start_time, end_time, status, notes, recurrence } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO schedules (id, date, client_id, employee_id, start_time, end_time, status, notes, recurrence)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [id, date, client_id, employee_id, start_time, end_time, status || 'scheduled', notes, recurrence || 'none']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/schedules/:id', async (req, res) => {
  const { date, client_id, employee_id, start_time, end_time, status, notes, recurrence } = req.body;
  try {
    const result = await pool.query(
      `UPDATE schedules SET date=$1, client_id=$2, employee_id=$3, start_time=$4, end_time=$5,
        status=$6, notes=$7, recurrence=$8
       WHERE id=$9 RETURNING *`,
      [date, client_id, employee_id, start_time, end_time, status, notes, recurrence, req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/schedules/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM schedules WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Clock Entries ─────────────────────────────────────────────────────────────

app.get('/api/clock-entries', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM clock_entries ORDER BY clock_in DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/clock-entries', async (req, res) => {
  const { id, employee_id, client_id, notes } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO clock_entries (id, employee_id, client_id, clock_in, notes)
       VALUES ($1,$2,$3,NOW(),$4) RETURNING *`,
      [id, employee_id, client_id, notes]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/clock-entries/:id/clock-out', async (req, res) => {
  try {
    const result = await pool.query(
      'UPDATE clock_entries SET clock_out = NOW() WHERE id = $1 RETURNING *',
      [req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/clock-entries/:id', async (req, res) => {
  const { employee_id, client_id, clock_in, clock_out, notes } = req.body;
  try {
    const result = await pool.query(
      `UPDATE clock_entries SET employee_id=$1, client_id=$2, clock_in=$3, clock_out=$4, notes=$5
       WHERE id=$6 RETURNING *`,
      [employee_id, client_id, clock_in, clock_out, notes, req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/clock-entries/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM clock_entries WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Invoices ──────────────────────────────────────────────────────────────────

app.get('/api/invoices', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM invoices ORDER BY date DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/invoices', async (req, res) => {
  const {
    id, invoice_number, date, due_date, client_id, status, items,
    subtotal, vat_rate, vat_amount, total, notes, payment_terms
  } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO invoices (id, invoice_number, date, due_date, client_id, status, items,
        subtotal, vat_rate, vat_amount, total, notes, payment_terms)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING *`,
      [id, invoice_number, date, due_date, client_id, status || 'draft',
       JSON.stringify(items || []), subtotal || 0, vat_rate || 17,
       vat_amount || 0, total || 0, notes, payment_terms]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/invoices/:id', async (req, res) => {
  const {
    invoice_number, date, due_date, client_id, status, items,
    subtotal, vat_rate, vat_amount, total, notes, payment_terms
  } = req.body;
  try {
    const result = await pool.query(
      `UPDATE invoices SET invoice_number=$1, date=$2, due_date=$3, client_id=$4, status=$5,
        items=$6, subtotal=$7, vat_rate=$8, vat_amount=$9, total=$10, notes=$11, payment_terms=$12
       WHERE id=$13 RETURNING *`,
      [invoice_number, date, due_date, client_id, status,
       JSON.stringify(items || []), subtotal, vat_rate, vat_amount, total,
       notes, payment_terms, req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/invoices/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM invoices WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Payslips ──────────────────────────────────────────────────────────────────

app.get('/api/payslips', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM payslips ORDER BY month DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/payslips', async (req, res) => {
  const {
    id, payslip_number, employee_id, month, total_hours, hourly_rate,
    gross_pay, social_charges, tax_estimate, net_pay, status
  } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO payslips (id, payslip_number, employee_id, month, total_hours, hourly_rate,
        gross_pay, social_charges, tax_estimate, net_pay, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
      [id, payslip_number, employee_id, month, total_hours || 0, hourly_rate || 0,
       gross_pay || 0, social_charges || 0, tax_estimate || 0, net_pay || 0, status || 'draft']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/payslips/:id', async (req, res) => {
  const {
    payslip_number, employee_id, month, total_hours, hourly_rate,
    gross_pay, social_charges, tax_estimate, net_pay, status
  } = req.body;
  try {
    const result = await pool.query(
      `UPDATE payslips SET payslip_number=$1, employee_id=$2, month=$3, total_hours=$4,
        hourly_rate=$5, gross_pay=$6, social_charges=$7, tax_estimate=$8, net_pay=$9, status=$10
       WHERE id=$11 RETURNING *`,
      [payslip_number, employee_id, month, total_hours, hourly_rate,
       gross_pay, social_charges, tax_estimate, net_pay, status, req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Settings ──────────────────────────────────────────────────────────────────

app.get('/api/settings', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM settings');
    const settings = {};
    result.rows.forEach(row => { settings[row.key] = row.value; });
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/settings', async (req, res) => {
  const body = req.body;
  try {
    for (const [key, value] of Object.entries(body)) {
      await pool.query(
        'INSERT INTO settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = $2',
        [key, value]
      );
    }
    const result = await pool.query('SELECT * FROM settings');
    const settings = {};
    result.rows.forEach(row => { settings[row.key] = row.value; });
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Start ─────────────────────────────────────────────────────────────────────

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

