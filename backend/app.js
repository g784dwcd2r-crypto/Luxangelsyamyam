require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const rateLimit = require('express-rate-limit');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const https = require('https');
const http = require('http');
const pool = require('./db');

const app = express();

// Trust reverse proxy (Render, etc.) so rate-limiting uses real IPs
app.set('trust proxy', 1);

// Middleware — explicit CORS so every browser (Safari, Firefox, Chrome) gets
// the right preflight response regardless of which origin is calling.
const ALLOWED_ORIGINS = [
  'https://luxangelsyamyam.onrender.com',
  'https://luxangelsyamyam-frontend.onrender.com',
  /\.onrender\.com$/,
  /\.netlify\.app$/,
  /localhost/,
  /127\.0\.0\.1/,
];
const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Postman, same-origin)
    if (!origin) return callback(null, true);
    const ok = ALLOWED_ORIGINS.some(p =>
      typeof p === 'string' ? p === origin : p.test(origin)
    );
    callback(null, ok);
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Handle preflight for all routes
app.use(bodyParser.json());

// Rate limiting — stricter on auth to prevent PIN brute-force
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts, please try again later.' },
});

const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please slow down.' },
});

app.use('/api/auth', authLimiter);
app.use('/api', apiLimiter);

app.get('/', (_req, res) => {
  res.json({ status: 'ok', message: 'Lux Angels API is running.' });
});

app.get('/api/health/db', async (_req, res) => {
  try {
    const result = await pool.query('SELECT NOW() AS now');
    res.json({ success: true, db: 'connected', now: result.rows[0].now });
  } catch (err) {
    console.error('DB health check failed:', err);
    res.status(500).json({ success: false, db: 'disconnected' });
  }
});

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------
const missing = (obj, fields) => fields.filter(f => obj[f] == null || obj[f] === '');

const getEmailGateway = () => {
  const provider = String(process.env.EMAIL_PROVIDER || '').trim().toLowerCase();
  const zeptoToken = String(process.env.ZEPTO_API_TOKEN || '').trim();
  const resendKey = String(process.env.RESEND_API_KEY || '').trim();

  if (provider === 'zeptomail' || (!provider && zeptoToken)) {
    return {
      provider: 'zeptomail',
      url: String(process.env.ZEPTO_API_URL || 'https://api.zeptomail.eu/v1.1/email').trim(),
      token: zeptoToken,
    };
  }

  if (provider === 'resend' || (!provider && resendKey)) {
    return {
      provider: 'resend',
      url: 'https://api.resend.com/emails',
      token: resendKey,
    };
  }

  return null;
};


const normalizeEmail = (value) => String(value || '').trim().toLowerCase();
const hashPassword = (password) => {
  const iterations = 210000;
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(String(password), salt, iterations, 32, 'sha256').toString('hex');
  return `pbkdf2$${iterations}$${salt}$${hash}`;
};

const verifyPassword = (password, storedHash) => {
  if (!storedHash || typeof storedHash !== 'string') return false;
  const [algo, iterRaw, salt, hash] = storedHash.split('$');
  if (algo !== 'pbkdf2' || !iterRaw || !salt || !hash) return false;
  const iterations = Number(iterRaw);
  if (!Number.isInteger(iterations) || iterations < 100000) return false;
  const calculated = crypto.pbkdf2Sync(String(password), salt, iterations, 32, 'sha256').toString('hex');
  return crypto.timingSafeEqual(Buffer.from(calculated, 'hex'), Buffer.from(hash, 'hex'));
};

const hashToken = (token) => crypto.createHash('sha256').update(String(token)).digest('hex');
const makeToken = () => crypto.randomBytes(32).toString('hex');
const makeEmployeeId = () => `EMP${Date.now().toString(36).toUpperCase()}${crypto.randomBytes(2).toString('hex').toUpperCase()}`;

const postJson = (urlString, { headers = {}, body = {} } = {}) =>
  new Promise((resolve, reject) => {
    try {
      const url = new URL(urlString);
      const transport = url.protocol === 'http:' ? http : https;
      const payload = JSON.stringify(body);
      const req = transport.request(
        {
          method: 'POST',
          hostname: url.hostname,
          port: url.port || undefined,
          path: `${url.pathname}${url.search}`,
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(payload),
            ...headers,
          },
        },
        (res) => {
          let responseBody = '';
          res.setEncoding('utf8');
          res.on('data', chunk => {
            responseBody += chunk;
          });
          res.on('end', () => {
            resolve({
              ok: res.statusCode >= 200 && res.statusCode < 300,
              status: res.statusCode,
              body: responseBody,
            });
          });
        }
      );
      req.on('error', reject);
      req.write(payload);
      req.end();
    } catch (err) {
      reject(err);
    }
  });

async function sendEmail({ to, subject, body, html, from }) {
  const gateway = getEmailGateway();
  if (!gateway?.token) return { ok: false, status: 503, error: 'Email provider is not configured' };

  const settingsResult = await pool.query(
    "SELECT key, value FROM settings WHERE key IN ('companyEmail', 'companyName')"
  );
  const settings = Object.fromEntries(settingsResult.rows.map(r => [r.key, String(r.value || '').trim()]));
  const senderEmail = String(from || settings.companyEmail || process.env.ZEPTO_FROM_ADDRESS || process.env.RESEND_FROM || '').trim();
  const senderName = settings.companyName || 'Lux Angels';
  if (!senderEmail) return { ok: false, status: 400, error: 'Sender email is missing' };

  if (gateway.provider === 'zeptomail') {
    const response = await postJson(gateway.url, {
      headers: {
        Authorization: `Zoho-enczapikey ${gateway.token}`,
      },
      body: {
        from: { address: senderEmail, name: senderName },
        to: [{ email_address: { address: to } }],
        subject,
        textbody: body || undefined,
        htmlbody: html || undefined,
        reply_to: [{ address: senderEmail }],
      },
    });
    if (!response.ok) {
      console.error('ZeptoMail rejected request:', response.status, response.body);
      return { ok: false, status: 502, error: 'Email provider rejected the request' };
    }
    return { ok: true, provider: 'zeptomail' };
  }

  const response = await postJson(gateway.url, {
    headers: {
      Authorization: `Bearer ${gateway.token}`,
    },
    body: {
      from: `${senderName} <${senderEmail}>`,
      to,
      subject,
      text: body || undefined,
      html: html || undefined,
      reply_to: senderEmail,
    },
  });
  if (!response.ok) {
    console.error('Resend rejected request:', response.status, response.body);
    return { ok: false, status: 502, error: 'Email provider rejected the request' };
  }
  return { ok: true, provider: 'resend' };
}

const ensureOwnerAccess = async ({ identifier, secret }) => {
  const result = await pool.query(
    "SELECT key, value FROM settings WHERE key IN ('ownerPin', 'ownerUsername', 'ownerEmail')"
  );
  const settings = Object.fromEntries(result.rows.map(r => [r.key, String(r.value || '').trim()]));
  const ownerPin = settings.ownerPin || '1234';
  const allowed = [settings.ownerUsername, settings.ownerEmail].map(v => String(v || '').trim().toLowerCase()).filter(Boolean);
  if (String(secret || '').trim() !== ownerPin) return false;
  if (allowed.length && identifier && !allowed.includes(String(identifier).trim().toLowerCase())) return false;
  return true;
};

// ---------------------------------------------------------------------------
// AUTH
// ---------------------------------------------------------------------------
app.post('/api/auth/pin-login', async (req, res) => {
  try {
    const { role, pin, employeeId } = req.body;
    const requestedRole = String(role || '').trim().toLowerCase();
    const submittedPin = String(pin || '').trim();
    const accountIdentifier = [
      employeeId,
      req.body.employee_id,
      req.body.employeeID,
      req.body.userId,
      req.body.username,
      req.body.email,
    ]
      .map(v => (v == null ? '' : String(v).trim()))
      .find(Boolean);

    if (!requestedRole || !submittedPin) return res.status(400).json({ error: 'role and pin are required' });

    if (requestedRole === 'owner') {
      const result = await pool.query(
        "SELECT key, value FROM settings WHERE key IN ('ownerPin', 'ownerUsername')"
      );
      const ownerSettings = Object.fromEntries(result.rows.map(r => [r.key, String(r.value || '').trim()]));
      const ownerPin = (ownerSettings.ownerPin || '1234').trim();
      const ownerUsername = (ownerSettings.ownerUsername || '').trim().toLowerCase();

      // If an ownerUsername is configured, require it to match
      if (ownerUsername && accountIdentifier && accountIdentifier.toLowerCase() !== ownerUsername) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      if (submittedPin !== ownerPin) return res.status(401).json({ error: 'Invalid credentials' });
      return res.json({ success: true, role: 'owner' });
    }

    if (requestedRole === 'manager') {
      const settingsResult = await pool.query(
        "SELECT key, value FROM settings WHERE key IN ('managerPin', 'managerUsername', 'companyEmail')"
      );
      const settings = Object.fromEntries(settingsResult.rows.map(r => [r.key, String(r.value || '').trim()]));
      const managerPin = (settings.managerPin || '4321').trim();
      const managerUsername = (settings.managerUsername || 'manager').toLowerCase();
      const managerAliases = [managerUsername, (settings.companyEmail || '').toLowerCase()].filter(Boolean);
      if (accountIdentifier && !managerAliases.includes(accountIdentifier.toLowerCase())) {
        return res.status(401).json({ error: 'Manager not found' });
      }
      if (submittedPin !== managerPin) return res.status(401).json({ error: 'Invalid PIN' });
      return res.json({ success: true, role: 'manager' });
    }

    if (requestedRole === 'cleaner' || requestedRole === 'employee') {
      const normalizedIdentifier = normalizeEmail(accountIdentifier);
      if (!normalizedIdentifier || !normalizedIdentifier.includes('@')) {
        return res.status(400).json({ error: 'A valid email is required for employee login' });
      }
      const result = await pool.query(
        `SELECT id, pin, password_hash, account_status, email_verified
         FROM employees
         WHERE LOWER(COALESCE(status, 'active')) = 'active'
           AND LOWER(email) = $1
         LIMIT 1`,
        [normalizedIdentifier]
      );
      if (!result.rows.length) return res.status(401).json({ error: 'Employee not found' });
      const employee = result.rows[0];
      if (!employee.email_verified) return res.status(403).json({ error: 'Email is not verified yet' });
      if (String(employee.account_status || 'approved') !== 'approved') {
        return res.status(403).json({ error: 'Account is waiting for owner approval' });
      }

      const passwordHash = String(employee.password_hash || '').trim();
      if (passwordHash) {
        if (!verifyPassword(submittedPin, passwordHash)) return res.status(401).json({ error: 'Invalid credentials' });
      } else if (submittedPin !== String(employee.pin).trim()) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      return res.json({ success: true, role: 'cleaner', employeeId: employee.id });
    }

    return res.status(400).json({ error: 'Invalid role' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});


app.post('/api/auth/register-employee', async (req, res) => {
  try {
    const name = String(req.body?.name || '').trim();
    const email = normalizeEmail(req.body?.email);
    const password = String(req.body?.password || '');
    if (!name || !email || !email.includes('@') || password.length < 10) {
      return res.status(400).json({ error: 'name, valid email and password (min 10 chars) are required' });
    }

    const existingEmployee = await pool.query('SELECT id FROM employees WHERE LOWER(email) = $1 LIMIT 1', [email]);
    if (existingEmployee.rows.length) return res.status(409).json({ error: 'An account with this email already exists' });

    const verificationToken = makeToken();
    const verificationHash = hashToken(verificationToken);
    const passwordHash = hashPassword(password);

    const requestResult = await pool.query(
      `INSERT INTO account_requests (id, name, email, password_hash, verification_token_hash, verification_expires_at, email_verified, approval_status)
       VALUES ($1,$2,$3,$4,$5,NOW() + INTERVAL '30 minutes',false,'pending_verification')
       ON CONFLICT (email)
       DO UPDATE SET name=EXCLUDED.name, password_hash=EXCLUDED.password_hash, verification_token_hash=EXCLUDED.verification_token_hash,
                     verification_expires_at=EXCLUDED.verification_expires_at, email_verified=false, approval_status='pending_verification',
                     rejection_reason=NULL, decided_at=NULL
       RETURNING id, email`,
      [makeEmployeeId(), name, email, passwordHash, verificationHash]
    );

    const verifyUrl = `${String(process.env.FRONTEND_URL || 'https://luxangelsyamyam-frontend.onrender.com').replace(/\/$/, '')}/verify-email?email=${encodeURIComponent(email)}&token=${verificationToken}`;
    const emailSend = await sendEmail({
      to: email,
      subject: 'Verify your Lux Angels account',
      body: `Hi ${name}, verify your email by opening this link: ${verifyUrl}`,
      html: `<p>Hi ${name},</p><p>Please verify your email:</p><p><a href="${verifyUrl}">Verify account</a></p>`,
    });

    if (!emailSend.ok) {
      return res.status(emailSend.status || 500).json({ error: emailSend.error || 'Failed to send verification email' });
    }

    res.status(201).json({ success: true, requestId: requestResult.rows[0].id, message: 'Verification email sent' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/auth/verify-email', async (req, res) => {
  try {
    const email = normalizeEmail(req.body?.email);
    const token = String(req.body?.token || '').trim();
    if (!email || !token) return res.status(400).json({ error: 'email and token are required' });

    const result = await pool.query(
      `UPDATE account_requests
       SET email_verified=true, approval_status='pending_approval'
       WHERE LOWER(email)=$1
         AND verification_token_hash=$2
         AND verification_expires_at > NOW()
       RETURNING id`,
      [email, hashToken(token)]
    );

    if (!result.rows.length) return res.status(400).json({ error: 'Invalid or expired verification token' });
    return res.json({ success: true, message: 'Email verified, waiting for owner approval' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/account-requests', async (req, res) => {
  try {
    const owner = String(req.query.owner || '').trim();
    const ownerPin = String(req.query.ownerPin || '').trim();
    if (!(await ensureOwnerAccess({ identifier: owner, secret: ownerPin }))) {
      return res.status(403).json({ error: 'Owner authentication failed' });
    }
    const status = String(req.query.status || '').trim();
    const where = status ? 'WHERE approval_status = $1' : '';
    const params = status ? [status] : [];
    const result = await pool.query(
      `SELECT id, name, email, email_verified, approval_status, rejection_reason, created_at, decided_at
       FROM account_requests ${where}
       ORDER BY created_at DESC`,
      params
    );
    return res.json(result.rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.patch('/api/account-requests/:id/decision', async (req, res) => {
  try {
    const owner = String(req.body?.owner || '').trim();
    const ownerPin = String(req.body?.ownerPin || '').trim();
    if (!(await ensureOwnerAccess({ identifier: owner, secret: ownerPin }))) {
      return res.status(403).json({ error: 'Owner authentication failed' });
    }

    const decision = String(req.body?.decision || '').trim().toLowerCase();
    const rejectionReason = String(req.body?.rejectionReason || '').trim();
    if (!['approve', 'reject'].includes(decision)) return res.status(400).json({ error: 'decision must be approve or reject' });

    const reqResult = await pool.query('SELECT * FROM account_requests WHERE id=$1 LIMIT 1', [req.params.id]);
    if (!reqResult.rows.length) return res.status(404).json({ error: 'Request not found' });
    const pending = reqResult.rows[0];
    if (!pending.email_verified) return res.status(400).json({ error: 'Email must be verified before approval decision' });

    if (decision === 'reject') {
      await pool.query(
        `UPDATE account_requests SET approval_status='rejected', rejection_reason=$1, decided_at=NOW() WHERE id=$2`,
        [rejectionReason || null, req.params.id]
      );
      return res.json({ success: true, status: 'rejected' });
    }

    const employeeInsert = await pool.query(
      `INSERT INTO employees (id, name, email, role, status, pin, password_hash, email_verified, account_status)
       VALUES ($1,$2,$3,'Cleaner','active','0000',$4,true,'approved')
       ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, email=EXCLUDED.email, password_hash=EXCLUDED.password_hash,
         email_verified=true, account_status='approved', status='active'
       RETURNING id`,
      [makeEmployeeId(), pending.name, normalizeEmail(pending.email), pending.password_hash]
    );

    await pool.query(
      `UPDATE account_requests SET approval_status='approved', decided_at=NOW() WHERE id=$1`,
      [req.params.id]
    );

    return res.json({ success: true, status: 'approved', employeeId: employeeInsert.rows[0].id });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ---------------------------------------------------------------------------
// EMPLOYEES
// ---------------------------------------------------------------------------
app.get('/api/employees', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM employees ORDER BY name');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/employees', async (req, res) => {
  try {
    const b = req.body;
    const absent = missing(b, ['name', 'email']);
    if (absent.length) return res.status(400).json({ error: `Missing required fields: ${absent.join(', ')}` });

    const email = normalizeEmail(b.email);
    if (!email || !email.includes('@')) return res.status(400).json({ error: 'A valid employee email is required' });

    const explicitPassword = String(b.password || '').trim();
    const passwordHash = b.password_hash || (explicitPassword ? hashPassword(explicitPassword) : null);

    const result = await pool.query(
      `INSERT INTO employees (id, name, email, phone, phone_mobile, role, hourly_rate, address, city,
        postal_code, country, start_date, status, contract_type, bank_iban, social_sec_number,
        date_of_birth, nationality, languages, transport, work_permit, emergency_name, emergency_phone,
        pin, notes, username, password_hash, email_verified, account_status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29)
       RETURNING *`,
      [b.id || makeEmployeeId(), b.name, email, b.phone||'', b.phone_mobile||'', b.role||'Cleaner',
       b.hourly_rate||15, b.address||'', b.city||'', b.postal_code||'', b.country||'Luxembourg',
       b.start_date||null, b.status||'active', b.contract_type||'CDI', b.bank_iban||'',
       b.social_sec_number||'', b.date_of_birth||null, b.nationality||'', b.languages||'',
       b.transport||'', b.work_permit||'', b.emergency_name||'', b.emergency_phone||'',
       b.pin||'0000', b.notes||'', (b.username||'').toLowerCase(), passwordHash,
       b.email_verified === false ? false : true, b.account_status || 'approved']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/employees/:id', async (req, res) => {
  try {
    const b = req.body;
    const result = await pool.query(
      `UPDATE employees SET name=$1, email=$2, phone=$3, phone_mobile=$4, role=$5, hourly_rate=$6,
        address=$7, city=$8, postal_code=$9, country=$10, start_date=$11, status=$12,
        contract_type=$13, bank_iban=$14, social_sec_number=$15, date_of_birth=$16,
        nationality=$17, languages=$18, transport=$19, work_permit=$20, emergency_name=$21,
        emergency_phone=$22, notes=$23, username=$24
       WHERE id=$25 RETURNING *`,
      [b.name, b.email||'', b.phone||'', b.phone_mobile||'', b.role||'Cleaner',
       b.hourly_rate||15, b.address||'', b.city||'', b.postal_code||'', b.country||'Luxembourg',
       b.start_date||null, b.status||'active', b.contract_type||'CDI', b.bank_iban||'',
       b.social_sec_number||'', b.date_of_birth||null, b.nationality||'', b.languages||'',
       b.transport||'', b.work_permit||'', b.emergency_name||'', b.emergency_phone||'',
       b.notes||'', (b.username||'').toLowerCase(), req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Employee not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/employees/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM employees WHERE id=$1 RETURNING id', [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ error: 'Employee not found' });
    res.json({ deleted: result.rows[0].id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/employees/:id/pin', async (req, res) => {
  try {
    const { pin, oldPin } = req.body;
    if (!pin) return res.status(400).json({ error: 'pin is required' });

    // If oldPin is provided, verify it first (employee self-service)
    if (oldPin !== undefined) {
      const check = await pool.query('SELECT pin FROM employees WHERE id=$1', [req.params.id]);
      if (!check.rows.length) return res.status(404).json({ error: 'Employee not found' });
      if (String(check.rows[0].pin).trim() !== String(oldPin).trim()) return res.status(401).json({ error: 'Old PIN is incorrect' });
    }

    const result = await pool.query('UPDATE employees SET pin=$1 WHERE id=$2 RETURNING id', [pin, req.params.id]);
    if (!result.rows.length) return res.status(404).json({ error: 'Employee not found' });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ---------------------------------------------------------------------------
// CLIENTS
// ---------------------------------------------------------------------------
app.get('/api/clients', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM clients ORDER BY name');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/clients', async (req, res) => {
  try {
    const b = req.body;
    const absent = missing(b, ['id', 'name']);
    if (absent.length) return res.status(400).json({ error: `Missing required fields: ${absent.join(', ')}` });

    const result = await pool.query(
      `INSERT INTO clients (id, name, contact_person, email, phone, phone_mobile, address,
        apartment_floor, city, postal_code, country, type, cleaning_frequency, billing_type,
        price_per_hour, price_fixed, status, language, access_code, key_location, parking_info,
        pet_info, preferred_day, preferred_time, contract_start, contract_end, square_meters,
        tax_id, special_instructions, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29,$30)
       RETURNING *`,
      [b.id, b.name, b.contact_person||'', b.email||'', b.phone||'', b.phone_mobile||'',
       b.address||'', b.apartment_floor||'', b.city||'', b.postal_code||'',
       b.country||'Luxembourg', b.type||'Residential', b.cleaning_frequency||'Weekly',
       b.billing_type||'hourly', b.price_per_hour||35, b.price_fixed||0, b.status||'active',
       b.language||'FR', b.access_code||'', b.key_location||'', b.parking_info||'',
       b.pet_info||'', b.preferred_day||'', b.preferred_time||'', b.contract_start||null,
       b.contract_end||null, b.square_meters||null, b.tax_id||'', b.special_instructions||'',
       b.notes||'']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/clients/:id', async (req, res) => {
  try {
    const b = req.body;
    const result = await pool.query(
      `UPDATE clients SET name=$1, contact_person=$2, email=$3, phone=$4, phone_mobile=$5,
        address=$6, apartment_floor=$7, city=$8, postal_code=$9, country=$10, type=$11,
        cleaning_frequency=$12, billing_type=$13, price_per_hour=$14, price_fixed=$15,
        status=$16, language=$17, access_code=$18, key_location=$19, parking_info=$20,
        pet_info=$21, preferred_day=$22, preferred_time=$23, contract_start=$24,
        contract_end=$25, square_meters=$26, tax_id=$27, special_instructions=$28, notes=$29
       WHERE id=$30 RETURNING *`,
      [b.name, b.contact_person||'', b.email||'', b.phone||'', b.phone_mobile||'',
       b.address||'', b.apartment_floor||'', b.city||'', b.postal_code||'',
       b.country||'Luxembourg', b.type||'Residential', b.cleaning_frequency||'Weekly',
       b.billing_type||'hourly', b.price_per_hour||35, b.price_fixed||0, b.status||'active',
       b.language||'FR', b.access_code||'', b.key_location||'', b.parking_info||'',
       b.pet_info||'', b.preferred_day||'', b.preferred_time||'', b.contract_start||null,
       b.contract_end||null, b.square_meters||null, b.tax_id||'', b.special_instructions||'',
       b.notes||'', req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Client not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/clients/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM clients WHERE id=$1 RETURNING id', [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ error: 'Client not found' });
    res.json({ deleted: result.rows[0].id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ---------------------------------------------------------------------------
// SCHEDULES
// ---------------------------------------------------------------------------
app.get('/api/schedules', async (req, res) => {
  try {
    const { employee_id, client_id, from, to, status } = req.query;
    const conditions = [];
    const params = [];
    if (employee_id) { params.push(employee_id); conditions.push(`employee_id = $${params.length}`); }
    if (client_id)   { params.push(client_id);   conditions.push(`client_id = $${params.length}`); }
    if (from)        { params.push(from);         conditions.push(`date >= $${params.length}`); }
    if (to)          { params.push(to);           conditions.push(`date <= $${params.length}`); }
    if (status)      { params.push(status);       conditions.push(`status = $${params.length}`); }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const result = await pool.query(`SELECT * FROM schedules ${where} ORDER BY date, start_time`, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/schedules', async (req, res) => {
  try {
    const b = req.body;
    const absent = missing(b, ['id', 'date']);
    if (absent.length) return res.status(400).json({ error: `Missing required fields: ${absent.join(', ')}` });

    const result = await pool.query(
      `INSERT INTO schedules (id, date, client_id, employee_id, start_time, end_time, status, notes, recurrence)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [b.id, b.date, b.client_id||null, b.employee_id||null, b.start_time||'08:00',
       b.end_time||'12:00', b.status||'scheduled', b.notes||'', b.recurrence||'none']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/schedules/:id', async (req, res) => {
  try {
    const b = req.body;
    const result = await pool.query(
      `UPDATE schedules SET date=$1, client_id=$2, employee_id=$3, start_time=$4,
        end_time=$5, status=$6, notes=$7, recurrence=$8
       WHERE id=$9 RETURNING *`,
      [b.date, b.client_id||null, b.employee_id||null, b.start_time||'08:00',
       b.end_time||'12:00', b.status||'scheduled', b.notes||'', b.recurrence||'none',
       req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Schedule not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/schedules/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM schedules WHERE id=$1 RETURNING id', [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ error: 'Schedule not found' });
    res.json({ deleted: result.rows[0].id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ---------------------------------------------------------------------------
// CLOCK ENTRIES
// ---------------------------------------------------------------------------
app.get('/api/clock-entries', async (req, res) => {
  try {
    const { employee_id, client_id, from, to } = req.query;
    const conditions = [];
    const params = [];
    if (employee_id) { params.push(employee_id); conditions.push(`employee_id = $${params.length}`); }
    if (client_id)   { params.push(client_id);   conditions.push(`client_id = $${params.length}`); }
    if (from)        { params.push(from);         conditions.push(`clock_in >= $${params.length}`); }
    if (to)          { params.push(to + 'T23:59:59Z'); conditions.push(`clock_in <= $${params.length}`); }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const result = await pool.query(`SELECT * FROM clock_entries ${where} ORDER BY clock_in DESC`, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/clock-entries', async (req, res) => {
  try {
    const b = req.body;
    const absent = missing(b, ['id', 'employee_id', 'clock_in']);
    if (absent.length) return res.status(400).json({ error: `Missing required fields: ${absent.join(', ')}` });

    const result = await pool.query(
      `INSERT INTO clock_entries (id, employee_id, client_id, clock_in, notes)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [b.id, b.employee_id, b.client_id||null, b.clock_in, b.notes||'']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/clock-entries/:id', async (req, res) => {
  try {
    const b = req.body;
    const result = await pool.query(
      `UPDATE clock_entries SET clock_out=$1, notes=$2 WHERE id=$3 RETURNING *`,
      [b.clock_out||null, b.notes||'', req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Clock entry not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ---------------------------------------------------------------------------
// INVOICES
// ---------------------------------------------------------------------------
app.get('/api/invoices', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM invoices ORDER BY date DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/invoices', async (req, res) => {
  try {
    const b = req.body;
    const absent = missing(b, ['id', 'invoice_number', 'date']);
    if (absent.length) return res.status(400).json({ error: `Missing required fields: ${absent.join(', ')}` });

    const result = await pool.query(
      `INSERT INTO invoices (id, invoice_number, date, due_date, client_id, status, items,
        subtotal, vat_rate, vat_amount, total, notes, payment_terms)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING *`,
      [b.id, b.invoice_number, b.date, b.due_date||null, b.client_id||null,
       b.status||'draft', JSON.stringify(b.items||[]), b.subtotal||0, b.vat_rate||17,
       b.vat_amount||0, b.total||0, b.notes||'', b.payment_terms||'']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/invoices/:id', async (req, res) => {
  try {
    const b = req.body;
    const result = await pool.query(
      `UPDATE invoices SET invoice_number=$1, date=$2, due_date=$3, client_id=$4, status=$5,
        items=$6, subtotal=$7, vat_rate=$8, vat_amount=$9, total=$10, notes=$11, payment_terms=$12
       WHERE id=$13 RETURNING *`,
      [b.invoice_number, b.date, b.due_date||null, b.client_id||null,
       b.status||'draft', JSON.stringify(b.items||[]), b.subtotal||0, b.vat_rate||17,
       b.vat_amount||0, b.total||0, b.notes||'', b.payment_terms||'', req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Invoice not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/invoices/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM invoices WHERE id=$1 RETURNING id', [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ error: 'Invoice not found' });
    res.json({ deleted: result.rows[0].id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ---------------------------------------------------------------------------
// PAYSLIPS
// ---------------------------------------------------------------------------
app.get('/api/payslips', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM payslips ORDER BY month DESC, created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/payslips', async (req, res) => {
  try {
    const b = req.body;
    const absent = missing(b, ['id', 'payslip_number', 'employee_id', 'month']);
    if (absent.length) return res.status(400).json({ error: `Missing required fields: ${absent.join(', ')}` });

    const result = await pool.query(
      `INSERT INTO payslips (id, payslip_number, employee_id, month, total_hours, hourly_rate,
        gross_pay, social_charges, tax_estimate, net_pay, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
      [b.id, b.payslip_number, b.employee_id, b.month, b.total_hours||0, b.hourly_rate||0,
       b.gross_pay||0, b.social_charges||0, b.tax_estimate||0, b.net_pay||0, b.status||'draft']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/payslips/:id', async (req, res) => {
  try {
    const b = req.body;
    const result = await pool.query(
      `UPDATE payslips SET payslip_number=$1, employee_id=$2, month=$3, total_hours=$4,
        hourly_rate=$5, gross_pay=$6, social_charges=$7, tax_estimate=$8, net_pay=$9, status=$10
       WHERE id=$11 RETURNING *`,
      [b.payslip_number, b.employee_id, b.month, b.total_hours||0, b.hourly_rate||0,
       b.gross_pay||0, b.social_charges||0, b.tax_estimate||0, b.net_pay||0,
       b.status||'draft', req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Payslip not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/payslips/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM payslips WHERE id=$1 RETURNING id', [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ error: 'Payslip not found' });
    res.json({ deleted: result.rows[0].id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ---------------------------------------------------------------------------
// SETTINGS
// ---------------------------------------------------------------------------
app.get('/api/settings', async (req, res) => {
  try {
    const result = await pool.query('SELECT key, value FROM settings');
    const settings = Object.fromEntries(result.rows.map(r => [r.key, r.value]));
    res.json(settings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/settings', async (req, res) => {
  try {
    const updates = req.body;
    if (!updates || typeof updates !== 'object') {
      return res.status(400).json({ error: 'Request body must be a key-value object' });
    }
    const entries = Object.entries(updates);
    if (!entries.length) return res.json({ success: true });

    await Promise.all(
      entries.map(([key, value]) =>
        pool.query(
          'INSERT INTO settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value',
          [key, String(value)]
        )
      )
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});


app.post('/api/notifications/email', async (req, res) => {
  try {
    const { to, subject, body, html, from } = req.body || {};
    if (!to || !subject || (!body && !html)) {
      return res.status(400).json({ error: 'to, subject and body/html are required' });
    }

    const sent = await sendEmail({ to, subject, body, html, from });
    if (!sent.ok) return res.status(sent.status || 500).json({ error: sent.error || 'Unable to send email notification' });
    return res.json({ success: true, provider: sent.provider });
  } catch (err) {
    console.error('Email notification send failed:', err);
    return res.status(500).json({ error: 'Unable to send email notification' });
  }
});

// ---------------------------------------------------------------------------
// Start server — initialize schema on first boot if tables are missing
// ---------------------------------------------------------------------------
async function initDb() {
  try {
    const { rows } = await pool.query(
      "SELECT to_regclass('public.settings') AS exists"
    );
    if (!rows[0].exists) {
      console.log('Database tables not found — running schema initialization…');
      const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
      await pool.query(schema);
      console.log('Schema initialized successfully.');
    }
    // Migrations for legacy databases
    await pool.query("ALTER TABLE employees ADD COLUMN IF NOT EXISTS username TEXT DEFAULT ''");
    await pool.query("ALTER TABLE employees ADD COLUMN IF NOT EXISTS password_hash TEXT");
    await pool.query("ALTER TABLE employees ADD COLUMN IF NOT EXISTS email_verified BOOLEAN NOT NULL DEFAULT false");
    await pool.query("ALTER TABLE employees ADD COLUMN IF NOT EXISTS account_status TEXT NOT NULL DEFAULT 'approved'");
    await pool.query("CREATE UNIQUE INDEX IF NOT EXISTS idx_employees_email_unique ON employees(LOWER(email))");

    await pool.query(`CREATE TABLE IF NOT EXISTS account_requests (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      verification_token_hash TEXT NOT NULL,
      verification_expires_at TIMESTAMPTZ NOT NULL,
      email_verified BOOLEAN NOT NULL DEFAULT false,
      approval_status TEXT NOT NULL DEFAULT 'pending_verification',
      rejection_reason TEXT,
      decided_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`);

    await pool.query("INSERT INTO settings (key, value) VALUES ('ownerEmail', 'owner@luxangels.lu') ON CONFLICT (key) DO NOTHING");
  } catch (err) {
    console.error('Schema initialization failed:', err.message);
  }
}

const PORT = process.env.PORT || 5000;
initDb().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    startKeepAlive();
  });
});

// ---------------------------------------------------------------------------
// Keep-alive — prevents Render free tier from spinning down after inactivity.
// Pings our own health endpoint every 10 minutes so the server stays awake 24/7.
// ---------------------------------------------------------------------------
function startKeepAlive() {
  const https = require('https');
  const http = require('http');
  const SELF_URL = (process.env.RENDER_EXTERNAL_URL || 'https://luxangelsyamyam-api.onrender.com').replace(/\/$/, '');
  const PING_URL = `${SELF_URL}/api/health/db`;
  const INTERVAL_MS = 10 * 60 * 1000; // every 10 minutes

  function ping() {
    const lib = PING_URL.startsWith('https') ? https : http;
    lib.get(PING_URL, (res) => {
      console.log(`[keep-alive] ${new Date().toISOString()} → ${res.statusCode}`);
      res.resume(); // drain response body
    }).on('error', (err) => {
      console.warn(`[keep-alive] ping failed: ${err.message}`);
    });
  }

  setInterval(ping, INTERVAL_MS);
  console.log(`[keep-alive] Self-ping every 10 min → ${PING_URL}`);
}
