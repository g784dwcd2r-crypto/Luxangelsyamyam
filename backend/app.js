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
const nodemailer = require('nodemailer');
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
// Photos are sent as base64 data URLs for some endpoints (e.g. prospect visits).
// Increase JSON body limit so those requests are not rejected with 413 payload-too-large.
app.use(bodyParser.json({ limit: '15mb' }));

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

app.get('/api/email-status', async (_req, res) => {
  try {
    const result = await pool.query(
      "SELECT key, value FROM settings WHERE key IN ('emailProvider','smtpHost','smtpPort','smtpSecure','smtpUser','smtpPass','zeptoApiToken','zeptoApiUrl','zeptoFromAddress','resendApiKey','resendFrom')"
    );
    const dbSettings = Object.fromEntries(result.rows.map(r => [r.key, r.value]));
    const gateway = getEmailGateway(dbSettings);
    res.json({ configured: !!gateway, provider: gateway ? gateway.provider : null });
  } catch {
    const gateway = getEmailGateway();
    res.json({ configured: !!gateway, provider: gateway ? gateway.provider : null });
  }
});

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------
const missing = (obj, fields) => fields.filter(f => obj[f] == null || obj[f] === '');

const getEmailGateway = (dbSettings = {}) => {
  const provider = String(process.env.EMAIL_PROVIDER || dbSettings.emailProvider || '').trim().toLowerCase();
  const zeptoToken = String(process.env.ZEPTO_API_TOKEN || dbSettings.zeptoApiToken || '').trim();
  const resendKey = String(process.env.RESEND_API_KEY || dbSettings.resendApiKey || '').trim();
  const smtpUser = String(process.env.SMTP_USER || dbSettings.smtpUser || '').trim();
  const smtpPass = String(process.env.SMTP_PASS || dbSettings.smtpPass || '').trim();

  if (provider === 'smtp' || (!provider && smtpUser && smtpPass)) {
    return {
      provider: 'smtp',
      host: String(process.env.SMTP_HOST || dbSettings.smtpHost || 'mail.infomaniak.com').trim(),
      port: parseInt(process.env.SMTP_PORT || dbSettings.smtpPort || '465', 10),
      secure: (process.env.SMTP_SECURE || dbSettings.smtpSecure || 'true').trim().toLowerCase() !== 'false',
      user: smtpUser,
      pass: smtpPass,
    };
  }

  if (provider === 'zeptomail' || (!provider && zeptoToken)) {
    return {
      provider: 'zeptomail',
      url: String(process.env.ZEPTO_API_URL || dbSettings.zeptoApiUrl || 'https://api.zeptomail.eu/v1.1/email').trim(),
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
  // Guard against malformed data in DB: timingSafeEqual throws if lengths differ.
  if (!/^[0-9a-f]+$/i.test(hash) || hash.length !== calculated.length) return false;
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

const postForm = (urlString, { headers = {}, body = {} } = {}) =>
  new Promise((resolve, reject) => {
    try {
      const url = new URL(urlString);
      const transport = url.protocol === 'http:' ? http : https;
      const payload = Object.entries(body)
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
        .join('&');
      const req = transport.request(
        {
          method: 'POST',
          hostname: url.hostname,
          port: url.port || undefined,
          path: `${url.pathname}${url.search}`,
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(payload),
            ...headers,
          },
        },
        (res) => {
          let responseBody = '';
          res.setEncoding('utf8');
          res.on('data', chunk => { responseBody += chunk; });
          res.on('end', () => {
            resolve({ ok: res.statusCode >= 200 && res.statusCode < 300, status: res.statusCode, body: responseBody });
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

const getSmsGateway = () => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_FROM_NUMBER;
  if (!accountSid || !authToken || !fromNumber) return null;
  return { accountSid, authToken, fromNumber };
};

async function sendSMS({ to, body }) {
  const gateway = getSmsGateway();
  if (!gateway) return { ok: false, status: 503, error: 'SMS provider is not configured. Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_FROM_NUMBER.' };
  const cleaned = String(to || '').replace(/[^\d+]/g, '').replace(/^00/, '+');
  if (!cleaned) return { ok: false, status: 400, error: 'Invalid phone number' };
  const url = `https://api.twilio.com/2010-04-01/Accounts/${gateway.accountSid}/Messages.json`;
  const auth = Buffer.from(`${gateway.accountSid}:${gateway.authToken}`).toString('base64');
  const response = await postForm(url, {
    headers: { Authorization: `Basic ${auth}` },
    body: { From: gateway.fromNumber, To: cleaned, Body: body },
  });
  if (!response.ok) {
    console.error('Twilio rejected request:', response.status, response.body);
    return { ok: false, status: 502, error: 'SMS provider rejected the request' };
  }
  return { ok: true, provider: 'twilio' };
}

async function sendEmail({ to, subject, body, html, from }) {
  const settingsResult = await pool.query(
    "SELECT key, value FROM settings WHERE key IN ('companyEmail','companyName','emailProvider','smtpHost','smtpPort','smtpSecure','smtpUser','smtpPass','zeptoApiToken','zeptoApiUrl','zeptoFromAddress','resendApiKey','resendFrom')"
  );
  const settings = Object.fromEntries(settingsResult.rows.map(r => [r.key, String(r.value || '').trim()]));

  const gateway = getEmailGateway(settings);
  if (!gateway) return { ok: false, status: 503, error: 'Email provider is not configured' };
  const senderEmail = String(from || settings.companyEmail || process.env.SMTP_USER || settings.smtpUser || process.env.ZEPTO_FROM_ADDRESS || settings.zeptoFromAddress || process.env.RESEND_FROM || settings.resendFrom || '').trim();
  const senderName = settings.companyName || 'Lux Angels';
  if (!senderEmail) return { ok: false, status: 400, error: 'Sender email is missing' };

  if (gateway.provider === 'smtp') {
    // For SMTP, the from address MUST match the authenticated SMTP_USER.
    // Using a different address (e.g. from DB settings) will cause most SMTP
    // servers (including Infomaniak) to reject the message with a 550 error.
    const smtpFrom = gateway.user;
    try {
      const transporter = nodemailer.createTransport({
        host: gateway.host,
        port: gateway.port,
        secure: gateway.secure,
        auth: { user: gateway.user, pass: gateway.pass },
      });
      await transporter.sendMail({
        from: `"${senderName}" <${smtpFrom}>`,
        to,
        subject,
        text: body || undefined,
        html: html || undefined,
        replyTo: smtpFrom,
      });
      return { ok: true, provider: 'smtp' };
    } catch (err) {
      console.error('SMTP send failed:', err);
      return { ok: false, status: 502, error: 'SMTP send failed: ' + err.message };
    }
  }

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
      return { ok: false, status: 502, error: `Email provider rejected the request (${response.status}): ${response.body}` };
    }
    return { ok: true, provider: 'zeptomail' };
  }

  const response = await postJson(gateway.url, {
    headers: {
      Authorization: `Bearer ${gateway.token}`,
    },
    body: {
      from: `${senderName} <${senderEmail}>`,
      to: [to],
      subject,
      text: body || undefined,
      html: html || undefined,
      reply_to: [senderEmail],
    },
  });
  if (!response.ok) {
    console.error('Resend rejected request:', response.status, response.body);
    return { ok: false, status: 502, error: `Email provider rejected the request (${response.status}): ${response.body}` };
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

// Public endpoint: returns {id, name, username} for active+approved cleaners only
// No sensitive data (no emails, no pins, no hashes)
app.get('/api/auth/agent-list', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, COALESCE(NULLIF(TRIM(username), ''), SPLIT_PART(name, ' ', 1)) AS display_name
       FROM employees
       WHERE LOWER(COALESCE(status, 'active')) = 'active'
         AND LOWER(COALESCE(account_status, 'approved')) = 'approved'
       ORDER BY name`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

app.post('/api/auth/pin-login', async (req, res) => {
  try {
    const { role, pin, employeeId } = req.body;
    const explicitEmployeeId = [employeeId, req.body.employee_id, req.body.employeeID]
      .map(v => (v == null ? '' : String(v).trim()))
      .find(Boolean);
    const requestedRole = String(role || '').trim().toLowerCase();
    const submittedPin = String(pin || '').trim();
    const accountIdentifier = [
      explicitEmployeeId,
      req.body.userId,
      req.body.username,
      req.body.email,
    ]
      .map(v => (v == null ? '' : String(v).trim()))
      .find(Boolean);

    if (!requestedRole || !submittedPin) return res.status(400).json({ error: 'role and pin are required' });

    if (requestedRole === 'owner') {
      const result = await pool.query(
        "SELECT key, value FROM settings WHERE key IN ('ownerPin', 'ownerUsername', 'owner_lang', 'owner_theme')"
      );
      const ownerSettings = Object.fromEntries(result.rows.map(r => [r.key, String(r.value || '').trim()]));
      const ownerPin = (ownerSettings.ownerPin || '1234').trim();
      const ownerUsername = (ownerSettings.ownerUsername || '').trim().toLowerCase();

      // If an ownerUsername is configured, require it to match
      if (ownerUsername && accountIdentifier && accountIdentifier.toLowerCase() !== ownerUsername) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      if (submittedPin !== ownerPin) return res.status(401).json({ error: 'Invalid credentials' });
      return res.json({ success: true, role: 'owner', lang: ownerSettings.owner_lang || 'fr', theme: ownerSettings.owner_theme || 'dark' });
    }

    if (requestedRole === 'manager') {
      const settingsResult = await pool.query(
        "SELECT key, value FROM settings WHERE key IN ('managerPin', 'managerUsername', 'companyEmail', 'manager_lang', 'manager_theme')"
      );
      const settings = Object.fromEntries(settingsResult.rows.map(r => [r.key, String(r.value || '').trim()]));
      const managerPin = (settings.managerPin || '4321').trim();
      const managerUsername = (settings.managerUsername || 'manager').toLowerCase();
      const managerAliases = [managerUsername, (settings.companyEmail || '').toLowerCase()].filter(Boolean);
      if (accountIdentifier && !managerAliases.includes(accountIdentifier.toLowerCase())) {
        return res.status(401).json({ error: 'Manager not found' });
      }
      if (submittedPin !== managerPin) return res.status(401).json({ error: 'Invalid PIN' });
      return res.json({ success: true, role: 'manager', lang: settings.manager_lang || 'fr', theme: settings.manager_theme || 'dark' });
    }

    if (requestedRole === 'cleaner' || requestedRole === 'employee') {
      // Support login by employee ID (from agent-list picker) OR by email
      let result;
      const looksLikeId = accountIdentifier && !accountIdentifier.includes('@') && accountIdentifier.length > 4;
      const shouldUseEmployeeId = Boolean(explicitEmployeeId) || looksLikeId;
      if (shouldUseEmployeeId) {
        // Login via employee ID selected from the agent list
        result = await pool.query(
          `SELECT id, pin, password_hash, account_status, email_verified,
                  COALESCE(lang, 'fr') AS lang, COALESCE(theme, 'dark') AS theme
           FROM employees
           WHERE LOWER(COALESCE(status, 'active')) = 'active'
             AND id = $1
           LIMIT 1`,
          [accountIdentifier]
        );
      } else {
        // Legacy: login via email
        const normalizedEmail = normalizeEmail(accountIdentifier);
        if (!normalizedEmail || !normalizedEmail.includes('@')) {
          return res.status(400).json({ error: 'A valid email or agent ID is required for employee login' });
        }
        result = await pool.query(
          `SELECT id, pin, password_hash, account_status, email_verified,
                  COALESCE(lang, 'fr') AS lang, COALESCE(theme, 'dark') AS theme
           FROM employees
           WHERE LOWER(COALESCE(status, 'active')) = 'active'
             AND LOWER(email) = $1
           LIMIT 1`,
          [normalizedEmail]
        );
      }

      if (!result.rows.length) return res.status(401).json({ error: 'Employee not found' });
      const employee = result.rows[0];
      // ID-based login bypasses email verification requirement (admin created them)
      if (!shouldUseEmployeeId && !employee.email_verified) {
        return res.status(403).json({ error: 'Email is not verified yet' });
      }
      if (String(employee.account_status || 'approved') !== 'approved') {
        return res.status(403).json({ error: 'Account is waiting for owner approval' });
      }

      const passwordHash = String(employee.password_hash || '').trim();
      if (passwordHash) {
        if (!verifyPassword(submittedPin, passwordHash)) return res.status(401).json({ error: 'Invalid credentials' });
      } else if (submittedPin !== String(employee.pin).trim()) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      return res.json({ success: true, role: 'cleaner', employeeId: employee.id, lang: employee.lang || 'fr', theme: employee.theme || 'dark' });
    }

    return res.status(400).json({ error: 'Invalid role' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});


// Save language/theme preference to DB for any user type
app.put('/api/preferences', async (req, res) => {
  try {
    const role = String(req.body?.role || '').toLowerCase();
    const lang = req.body?.lang ? String(req.body.lang).trim() : null;
    const theme = req.body?.theme ? String(req.body.theme).trim() : null;
    if (!role) return res.status(400).json({ error: 'role is required' });
    if (!lang && !theme) return res.status(400).json({ error: 'lang or theme is required' });

    if (role === 'owner') {
      if (lang) await pool.query("INSERT INTO settings (key, value) VALUES ('owner_lang', $1) ON CONFLICT (key) DO UPDATE SET value = $1", [lang]);
      if (theme) await pool.query("INSERT INTO settings (key, value) VALUES ('owner_theme', $1) ON CONFLICT (key) DO UPDATE SET value = $1", [theme]);
      return res.json({ success: true });
    }
    if (role === 'manager') {
      if (lang) await pool.query("INSERT INTO settings (key, value) VALUES ('manager_lang', $1) ON CONFLICT (key) DO UPDATE SET value = $1", [lang]);
      if (theme) await pool.query("INSERT INTO settings (key, value) VALUES ('manager_theme', $1) ON CONFLICT (key) DO UPDATE SET value = $1", [theme]);
      return res.json({ success: true });
    }
    if (role === 'cleaner' || role === 'employee') {
      const userId = String(req.body?.userId || '').trim();
      if (!userId) return res.status(400).json({ error: 'userId is required for employee preferences' });
      const fields = [];
      const values = [];
      if (lang) { fields.push(`lang = $${fields.length + 1}`); values.push(lang); }
      if (theme) { fields.push(`theme = $${fields.length + 1}`); values.push(theme); }
      values.push(userId);
      await pool.query(`UPDATE employees SET ${fields.join(', ')} WHERE id = $${values.length}`, values);
      return res.json({ success: true });
    }
    return res.status(400).json({ error: 'Invalid role' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Internal server error' });
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
    res.status(500).json({ error: err.message || 'Internal server error' });
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
    res.status(500).json({ error: err.message || 'Internal server error' });
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
    return res.status(500).json({ error: err.message || 'Internal server error' });
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
    return res.status(500).json({ error: err.message || 'Internal server error' });
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
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

app.post('/api/employees', async (req, res) => {
  try {
    const b = req.body;
    const absent = missing(b, ['name']);
    if (absent.length) return res.status(400).json({ error: `Missing required fields: ${absent.join(', ')}` });

    const rawEmail = String(b.email || '').trim();
    const email = rawEmail ? normalizeEmail(rawEmail) : null;
    if (rawEmail && (!email || !email.includes('@'))) {
      return res.status(400).json({ error: 'A valid employee email is required when provided' });
    }

    const explicitPassword = String(b.password || '').trim();
    const passwordHash = b.password_hash || (explicitPassword ? hashPassword(explicitPassword) : null);

    const result = await pool.query(
      `INSERT INTO employees (id, name, email, phone, phone_mobile, role, hourly_rate, weekly_hours, address, city,
        postal_code, country, start_date, status, contract_type, contract_end_date, bank_iban, social_sec_number,
        date_of_birth, nationality, languages, transport, work_permit, emergency_name, emergency_phone,
        pin, notes, username, password_hash, email_verified, account_status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29,$30,$31)
       RETURNING *`,
      [b.id || makeEmployeeId(), b.name, email, b.phone||'', b.phone_mobile||'', b.role||'Cleaner',
       b.hourly_rate||15, b.weekly_hours||0, b.address||'', b.city||'', b.postal_code||'', b.country||'Luxembourg',
       b.start_date||null, b.status||'active', b.contract_type||'CDI', b.contract_end_date||null,
       b.bank_iban||'', b.social_sec_number||'', b.date_of_birth||null, b.nationality||'', b.languages||'',
       b.transport||'', b.work_permit||'', b.emergency_name||'', b.emergency_phone||'',
       b.pin||'0000', b.notes||'', (b.username||'').toLowerCase(), passwordHash,
       b.email_verified === false ? false : true, b.account_status || 'approved']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

app.put('/api/employees/:id', async (req, res) => {
  try {
    const b = req.body;
    const rawEmail = String(b.email || '').trim();
    const email = rawEmail ? normalizeEmail(rawEmail) : null;
    if (rawEmail && (!email || !email.includes('@'))) {
      return res.status(400).json({ error: 'A valid employee email is required when provided' });
    }

    const result = await pool.query(
      `UPDATE employees SET name=$1, email=$2, phone=$3, phone_mobile=$4, role=$5, hourly_rate=$6,
        weekly_hours=$7, address=$8, city=$9, postal_code=$10, country=$11, start_date=$12, status=$13,
        contract_type=$14, contract_end_date=$15, bank_iban=$16, social_sec_number=$17, date_of_birth=$18,
        nationality=$19, languages=$20, transport=$21, work_permit=$22, emergency_name=$23,
        emergency_phone=$24, notes=$25, username=$26
       WHERE id=$27 RETURNING *`,
      [b.name, email, b.phone||'', b.phone_mobile||'', b.role||'Cleaner',
       b.hourly_rate||15, b.weekly_hours||0, b.address||'', b.city||'', b.postal_code||'', b.country||'Luxembourg',
       b.start_date||null, b.status||'active', b.contract_type||'CDI', b.contract_end_date||null,
       b.bank_iban||'', b.social_sec_number||'', b.date_of_birth||null, b.nationality||'', b.languages||'',
       b.transport||'', b.work_permit||'', b.emergency_name||'', b.emergency_phone||'',
       b.notes||'', (b.username||'').toLowerCase(), req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Employee not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

app.delete('/api/employees/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM employees WHERE id=$1 RETURNING id', [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ error: 'Employee not found' });
    res.json({ deleted: result.rows[0].id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

app.put('/api/employees/:id/profile-picture', async (req, res) => {
  try {
    const { imageData } = req.body;
    if (!imageData && imageData !== null) return res.status(400).json({ error: 'imageData is required' });
    const result = await pool.query(
      'UPDATE employees SET profile_picture=$1 WHERE id=$2 RETURNING id, profile_picture',
      [imageData || null, req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Employee not found' });
    res.json({ success: true, profile_picture: result.rows[0].profile_picture });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Internal server error' });
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
    res.status(500).json({ error: err.message || 'Internal server error' });
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
    res.status(500).json({ error: err.message || 'Internal server error' });
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
        tax_id, special_instructions, notes, meta)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29,$30,$31)
       RETURNING *`,
      [b.id, b.name, b.contact_person||'', b.email||'', b.phone||'', b.phone_mobile||'',
       b.address||'', b.apartment_floor||'', b.city||'', b.postal_code||'',
       b.country||'Luxembourg', b.type||'Residential', b.cleaning_frequency||'Weekly',
       b.billing_type||'hourly', b.price_per_hour||35, b.price_fixed||0, b.status||'active',
       b.language||'FR', b.access_code||'', b.key_location||'', b.parking_info||'',
       b.pet_info||'', b.preferred_day||'', b.preferred_time||'', b.contract_start||null,
       b.contract_end||null, b.square_meters||null, b.tax_id||'', b.special_instructions||'',
       b.notes||'', b.meta || {}]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Internal server error' });
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
        contract_end=$25, square_meters=$26, tax_id=$27, special_instructions=$28, notes=$29, meta=$30
       WHERE id=$31 RETURNING *`,
      [b.name, b.contact_person||'', b.email||'', b.phone||'', b.phone_mobile||'',
       b.address||'', b.apartment_floor||'', b.city||'', b.postal_code||'',
       b.country||'Luxembourg', b.type||'Residential', b.cleaning_frequency||'Weekly',
       b.billing_type||'hourly', b.price_per_hour||35, b.price_fixed||0, b.status||'active',
       b.language||'FR', b.access_code||'', b.key_location||'', b.parking_info||'',
       b.pet_info||'', b.preferred_day||'', b.preferred_time||'', b.contract_start||null,
       b.contract_end||null, b.square_meters||null, b.tax_id||'', b.special_instructions||'',
       b.notes||'', b.meta || {}, req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Client not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

app.delete('/api/clients/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM clients WHERE id=$1 RETURNING id', [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ error: 'Client not found' });
    res.json({ deleted: result.rows[0].id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Internal server error' });
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
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

app.post('/api/schedules', async (req, res) => {
  try {
    const b = req.body;
    const absent = missing(b, ['id', 'date']);
    if (absent.length) return res.status(400).json({ error: `Missing required fields: ${absent.join(', ')}` });

    const result = await pool.query(
      `INSERT INTO schedules (id, date, client_id, employee_id, start_time, end_time, status, notes, recurrence, payment_status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [b.id, b.date, b.client_id||null, b.employee_id||null, b.start_time||'08:00',
       b.end_time||'12:00', b.status||'scheduled', b.notes||'', b.recurrence||'none',
       b.payment_status||'unpaid']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

app.put('/api/schedules/:id', async (req, res) => {
  try {
    const b = req.body;
    const result = await pool.query(
      `UPDATE schedules SET date=$1, client_id=$2, employee_id=$3, start_time=$4,
        end_time=$5, status=$6, notes=$7, recurrence=$8, payment_status=$9
       WHERE id=$10 RETURNING *`,
      [b.date, b.client_id||null, b.employee_id||null, b.start_time||'08:00',
       b.end_time||'12:00', b.status||'scheduled', b.notes||'', b.recurrence||'none',
       b.payment_status||'unpaid', req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Schedule not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

app.delete('/api/schedules/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM schedules WHERE id=$1 RETURNING id', [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ error: 'Schedule not found' });
    res.json({ deleted: result.rows[0].id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Internal server error' });
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
    res.status(500).json({ error: err.message || 'Internal server error' });
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
    res.status(500).json({ error: err.message || 'Internal server error' });
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
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

app.delete('/api/clock-entries/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM clock_entries WHERE id=$1 RETURNING id', [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ error: 'Clock entry not found' });
    res.json({ deleted: result.rows[0].id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Internal server error' });
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
    res.status(500).json({ error: err.message || 'Internal server error' });
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
    res.status(500).json({ error: err.message || 'Internal server error' });
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
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

app.patch('/api/invoices/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ['draft', 'sent', 'paid', 'overdue'];
    if (!allowed.includes(status)) return res.status(400).json({ error: 'Invalid status' });
    const result = await pool.query(
      'UPDATE invoices SET status=$1 WHERE id=$2 RETURNING *',
      [status, req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Invoice not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

app.delete('/api/invoices/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM invoices WHERE id=$1 RETURNING id', [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ error: 'Invoice not found' });
    res.json({ deleted: result.rows[0].id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Internal server error' });
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
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

app.post('/api/payslips', async (req, res) => {
  try {
    const b = req.body;
    const absent = missing(b, ['id', 'payslip_number', 'employee_id', 'month']);
    if (absent.length) return res.status(400).json({ error: `Missing required fields: ${absent.join(', ')}` });

    const result = await pool.query(
      `INSERT INTO payslips (id, payslip_number, employee_id, month, period_start, period_end, total_hours, hourly_rate,
        gross_pay, social_charges, tax_estimate, net_pay, hour_breakdown, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) RETURNING *`,
      [b.id, b.payslip_number, b.employee_id, b.month, b.period_start || null, b.period_end || null, b.total_hours || 0, b.hourly_rate || 0,
       b.gross_pay || 0, b.social_charges || 0, b.tax_estimate || 0, b.net_pay || 0, JSON.stringify(Array.isArray(b.hour_breakdown) ? b.hour_breakdown : []), b.status || 'draft']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

app.put('/api/payslips/:id', async (req, res) => {
  try {
    const b = req.body;
    const result = await pool.query(
      `UPDATE payslips SET payslip_number=$1, employee_id=$2, month=$3, period_start=$4, period_end=$5, total_hours=$6,
        hourly_rate=$7, gross_pay=$8, social_charges=$9, tax_estimate=$10, net_pay=$11, hour_breakdown=$12, status=$13
       WHERE id=$14 RETURNING *`,
      [b.payslip_number, b.employee_id, b.month, b.period_start || null, b.period_end || null, b.total_hours || 0, b.hourly_rate || 0,
       b.gross_pay || 0, b.social_charges || 0, b.tax_estimate || 0, b.net_pay || 0, JSON.stringify(Array.isArray(b.hour_breakdown) ? b.hour_breakdown : []),
       b.status || 'draft', req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Payslip not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

app.delete('/api/payslips/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM payslips WHERE id=$1 RETURNING id', [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ error: 'Payslip not found' });
    res.json({ deleted: result.rows[0].id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Internal server error' });
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
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

app.put('/api/settings', async (req, res) => {
  try {
    const updates = req.body;
    if (!updates || typeof updates !== 'object') {
      return res.status(400).json({ error: 'Request body must be a key-value object' });
    }
    const serializeSettingValue = (value) => {
      if (value == null) return '';
      if (typeof value === 'object') {
        try {
          return JSON.stringify(value);
        } catch {
          return String(value);
        }
      }
      return String(value);
    };

    const entries = Object.entries(updates).filter(([, value]) => value !== undefined);
    if (!entries.length) return res.json({ success: true });

    await Promise.all(
      entries.map(([key, value]) =>
        pool.query(
          'INSERT INTO settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value',
          [key, serializeSettingValue(value)]
        )
      )
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});


// Test SMTP connection using credentials supplied in the request body.
// No PIN required — only verifies connectivity, no data is accessed or sent.
// Body: { host, port, secure, user, pass }
app.post('/api/email/test-connection', async (req, res) => {
  try {
    const { host, port, secure, user, pass } = req.body || {};
    if (!host || !user || !pass) {
      return res.status(400).json({ ok: false, error: 'host, user and pass are required' });
    }
    const transporter = nodemailer.createTransport({
      host: String(host).trim(),
      port: parseInt(port, 10) || 465,
      secure: String(secure).trim().toLowerCase() !== 'false',
      auth: { user: String(user).trim(), pass: String(pass).trim() },
    });
    await transporter.verify();
    return res.json({ ok: true });
  } catch (err) {
    return res.json({ ok: false, error: err.message || 'Connection failed' });
  }
});

// Diagnostic endpoint — returns email config status and optionally sends a test email.
// Usage: POST /api/admin/test-email  { "to": "you@example.com" }
// Protected by owner PIN: pass ?pin=YOUR_PIN or body.pin
app.post('/api/admin/test-email', async (req, res) => {
  try {
    const pin = String(req.body?.pin || req.query.pin || '').trim();
    const authorized = await ensureOwnerAccess({ identifier: '', secret: pin });
    if (!authorized) return res.status(403).json({ error: 'Unauthorized' });

    const settingsResult2 = await pool.query(
      "SELECT key, value FROM settings WHERE key IN ('emailProvider','smtpHost','smtpPort','smtpSecure','smtpUser','smtpPass','zeptoApiToken','zeptoApiUrl','resendApiKey')"
    );
    const dbSettings2 = Object.fromEntries(settingsResult2.rows.map(r => [r.key, r.value]));
    const gateway = getEmailGateway(dbSettings2);
    const config = gateway
      ? { provider: gateway.provider, configured: true, ...(gateway.provider === 'smtp' ? { host: gateway.host, port: gateway.port, secure: gateway.secure, user: gateway.user } : {}) }
      : { configured: false };

    const to = String(req.body?.to || '').trim();
    if (!to) return res.json({ config });

    const result = await sendEmail({
      to,
      subject: 'Lux Angels — test email',
      body: 'This is a test email from your Lux Angels backend.',
      html: '<p>This is a <strong>test email</strong> from your Lux Angels backend.</p>',
    });
    return res.json({ config, send: result });
  } catch (err) {
    console.error('test-email error:', err);
    return res.status(500).json({ error: err.message });
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

app.post('/api/notifications/sms', async (req, res) => {
  try {
    const { to, body } = req.body || {};
    if (!to || !body) {
      return res.status(400).json({ error: 'to and body are required' });
    }
    const sent = await sendSMS({ to, body });
    if (!sent.ok) return res.status(sent.status || 500).json({ error: sent.error || 'Unable to send SMS' });
    return res.json({ success: true, provider: sent.provider });
  } catch (err) {
    console.error('SMS notification send failed:', err);
    return res.status(500).json({ error: 'Unable to send SMS notification' });
  }
});

// ---------------------------------------------------------------------------
// QUOTES
// ---------------------------------------------------------------------------
app.get('/api/quotes', async (_req, res) => {
  try {
    const result = await pool.query('SELECT * FROM quotes ORDER BY date DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

app.post('/api/quotes', async (req, res) => {
  try {
    const b = req.body;
    if (!b.id || !b.quoteNumber || !b.date) return res.status(400).json({ error: 'Missing required fields: id, quoteNumber, date' });
    const result = await pool.query(
      `INSERT INTO quotes (id, quote_number, date, client_id, status, items, subtotal, vat_rate, vat_amount, total, notes, pricing_mode, job_schedule, visible_columns)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) RETURNING *`,
      [b.id, b.quoteNumber, b.date, b.clientId || null, b.status || 'draft',
       JSON.stringify(b.items || []), b.subtotal || 0, b.vatRate || 17,
       b.vatAmount || 0, b.total || 0, b.notes || '',
       b.pricingMode || 'hours', JSON.stringify(b.jobSchedule || {}), JSON.stringify(b.visibleColumns || {})]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

app.put('/api/quotes/:id', async (req, res) => {
  try {
    const b = req.body;
    const result = await pool.query(
      `UPDATE quotes SET quote_number=$1, date=$2, client_id=$3, status=$4, items=$5, subtotal=$6,
       vat_rate=$7, vat_amount=$8, total=$9, notes=$10, pricing_mode=$11, job_schedule=$12, visible_columns=$13
       WHERE id=$14 RETURNING *`,
      [b.quoteNumber, b.date, b.clientId || null, b.status || 'draft',
       JSON.stringify(b.items || []), b.subtotal || 0, b.vatRate || 17,
       b.vatAmount || 0, b.total || 0, b.notes || '',
       b.pricingMode || 'hours', JSON.stringify(b.jobSchedule || {}), JSON.stringify(b.visibleColumns || {}),
       req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Quote not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

app.delete('/api/quotes/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM quotes WHERE id=$1 RETURNING id', [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ error: 'Quote not found' });
    res.json({ deleted: result.rows[0].id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// ---------------------------------------------------------------------------
// PHOTO UPLOADS
// ---------------------------------------------------------------------------
app.get('/api/photo-uploads', async (_req, res) => {
  try {
    const result = await pool.query('SELECT * FROM photo_uploads ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

app.post('/api/photo-uploads', async (req, res) => {
  try {
    const b = req.body;
    if (!b.id) return res.status(400).json({ error: 'Missing required field: id' });
    const result = await pool.query(
      `INSERT INTO photo_uploads (id, employee_id, client_id, clock_entry_id, file_name, image_data, note, type, seen_by_owner)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [b.id, b.employeeId || null, b.clientId || null, b.clockEntryId || null,
       b.fileName || '', b.imageData || '', b.note || '', b.type || 'issue', b.seenByOwner || false]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

app.patch('/api/photo-uploads/seen', async (_req, res) => {
  try {
    await pool.query('UPDATE photo_uploads SET seen_by_owner=TRUE WHERE seen_by_owner=FALSE');
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

app.delete('/api/photo-uploads/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM photo_uploads WHERE id=$1 RETURNING id', [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ error: 'Photo upload not found' });
    res.json({ deleted: result.rows[0].id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// ---------------------------------------------------------------------------
// TIME OFF REQUESTS
// ---------------------------------------------------------------------------
app.get('/api/time-off-requests', async (_req, res) => {
  try {
    const result = await pool.query('SELECT * FROM time_off_requests ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

app.post('/api/time-off-requests', async (req, res) => {
  try {
    const b = req.body;
    if (!b.id || !b.startDate || !b.endDate) return res.status(400).json({ error: 'Missing required fields: id, startDate, endDate' });
    const result = await pool.query(
      `INSERT INTO time_off_requests (id, employee_id, start_date, end_date, requested_days, reason, leave_type, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [b.id, b.employeeId || null, b.startDate, b.endDate,
       b.requestedDays || 1, b.reason || '', b.leaveType || 'conge', b.status || 'pending']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

app.patch('/api/time-off-requests/:id', async (req, res) => {
  try {
    const { status, reviewedBy, reviewNote } = req.body;
    const result = await pool.query(
      `UPDATE time_off_requests SET status=$1, reviewed_at=NOW(), reviewed_by=$2, review_note=$3 WHERE id=$4 RETURNING *`,
      [status, reviewedBy || null, reviewNote || '', req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Time-off request not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

app.delete('/api/time-off-requests/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM time_off_requests WHERE id=$1 RETURNING id', [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ error: 'Time-off request not found' });
    res.json({ deleted: result.rows[0].id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// ---------------------------------------------------------------------------
// INVENTORY PRODUCTS
// ---------------------------------------------------------------------------
app.get('/api/inventory-products', async (_req, res) => {
  try {
    const result = await pool.query('SELECT * FROM inventory_products ORDER BY name');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

app.post('/api/inventory-products', async (req, res) => {
  try {
    const b = req.body;
    if (!b.id || !b.name) return res.status(400).json({ error: 'Missing required fields: id, name' });
    const result = await pool.query(
      `INSERT INTO inventory_products (id, name, unit, stock, min_stock, note, active)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [b.id, b.name, b.unit || 'bottles', b.stock || 0, b.minStock || 0, b.note || '', b.active !== false]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

app.put('/api/inventory-products/:id', async (req, res) => {
  try {
    const b = req.body;
    const result = await pool.query(
      `UPDATE inventory_products SET name=$1, unit=$2, stock=$3, min_stock=$4, note=$5, active=$6 WHERE id=$7 RETURNING *`,
      [b.name, b.unit || 'bottles', b.stock || 0, b.minStock || 0, b.note || '', b.active !== false, req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Product not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

app.delete('/api/inventory-products/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM inventory_products WHERE id=$1 RETURNING id', [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ error: 'Product not found' });
    res.json({ deleted: result.rows[0].id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// ---------------------------------------------------------------------------
// PRODUCT REQUESTS
// ---------------------------------------------------------------------------
app.get('/api/product-requests', async (_req, res) => {
  try {
    const result = await pool.query('SELECT * FROM product_requests ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

app.post('/api/product-requests', async (req, res) => {
  try {
    const b = req.body;
    if (!b.id || !b.productId) return res.status(400).json({ error: 'Missing required fields: id, productId' });
    const result = await pool.query(
      `INSERT INTO product_requests (id, employee_id, product_id, quantity, note, delivery_at, status, approved_qty, delivered_qty)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [b.id, b.employeeId || null, b.productId, b.quantity || 1,
       b.note || '', b.deliveryAt || '', b.status || 'pending', b.approvedQty || 0, b.deliveredQty || 0]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

app.patch('/api/product-requests/:id', async (req, res) => {
  try {
    const b = req.body;
    const result = await pool.query(
      `UPDATE product_requests SET status=$1, approved_qty=$2, delivered_qty=$3 WHERE id=$4 RETURNING *`,
      [b.status, b.approvedQty || 0, b.deliveredQty || 0, req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Product request not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

app.delete('/api/product-requests/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM product_requests WHERE id=$1 RETURNING id', [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ error: 'Product request not found' });
    res.json({ deleted: result.rows[0].id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// ---------------------------------------------------------------------------
// CLEANER PRODUCT HOLDINGS
// ---------------------------------------------------------------------------
app.get('/api/cleaner-product-holdings', async (_req, res) => {
  try {
    const result = await pool.query('SELECT * FROM cleaner_product_holdings ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

app.post('/api/cleaner-product-holdings', async (req, res) => {
  try {
    const b = req.body;
    if (!b.id) return res.status(400).json({ error: 'Missing required field: id' });
    const result = await pool.query(
      `INSERT INTO cleaner_product_holdings (id, employee_id, product_id, qty_in_hand, updated_at)
       VALUES ($1,$2,$3,$4,NOW()) RETURNING *`,
      [b.id, b.employeeId || null, b.productId || null, b.qtyInHand || 0]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

app.put('/api/cleaner-product-holdings/:id', async (req, res) => {
  try {
    const { qtyInHand } = req.body;
    const result = await pool.query(
      `UPDATE cleaner_product_holdings SET qty_in_hand=$1, updated_at=NOW() WHERE id=$2 RETURNING *`,
      [qtyInHand || 0, req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Holding not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

app.delete('/api/cleaner-product-holdings/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM cleaner_product_holdings WHERE id=$1 RETURNING id', [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ error: 'Holding not found' });
    res.json({ deleted: result.rows[0].id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// ---------------------------------------------------------------------------
// PROSPECT VISITS
// ---------------------------------------------------------------------------
app.get('/api/prospect-visits', async (_req, res) => {
  try {
    const result = await pool.query('SELECT * FROM prospect_visits ORDER BY visit_date DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

app.post('/api/prospect-visits', async (req, res) => {
  try {
    const b = req.body;
    if (!b.id || !b.visitDate) return res.status(400).json({ error: 'Missing required fields: id, visitDate' });
    const result = await pool.query(
      `INSERT INTO prospect_visits (id, client_id, visit_date, visit_time, address, notes, status, photos)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [b.id, b.clientId || null, b.visitDate, b.visitTime || '',
       b.address || '', b.notes || '', b.status || 'planned', JSON.stringify(b.photos || [])]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

app.patch('/api/prospect-visits/:id', async (req, res) => {
  try {
    const { status } = req.body;
    const result = await pool.query(
      `UPDATE prospect_visits SET status=$1, updated_at=NOW() WHERE id=$2 RETURNING *`,
      [status, req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Visit not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

app.delete('/api/prospect-visits/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM prospect_visits WHERE id=$1 RETURNING id', [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ error: 'Visit not found' });
    res.json({ deleted: result.rows[0].id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// ---------------------------------------------------------------------------
// EXPENSES
// ---------------------------------------------------------------------------
app.get('/api/expenses', async (_req, res) => {
  try {
    const result = await pool.query('SELECT * FROM expenses ORDER BY name');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

app.post('/api/expenses', async (req, res) => {
  try {
    const b = req.body;
    if (!b.id || !b.name) return res.status(400).json({ error: 'Missing required fields: id, name' });
    const result = await pool.query(
      `INSERT INTO expenses (id, name, amount, due_day, category, note, is_active, payments)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [b.id, b.name, b.amount || 0, b.dueDay || 1, b.category || 'other',
       b.note || b.notes || '', b.isActive !== false, JSON.stringify(b.payments || [])]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

app.put('/api/expenses/:id', async (req, res) => {
  try {
    const b = req.body;
    const result = await pool.query(
      `UPDATE expenses SET name=$1, amount=$2, due_day=$3, category=$4, note=$5, is_active=$6, payments=$7 WHERE id=$8 RETURNING *`,
      [b.name, b.amount || 0, b.dueDay || 1, b.category || 'other',
       b.note || b.notes || '', b.isActive !== false, JSON.stringify(b.payments || []), req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Expense not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

app.delete('/api/expenses/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM expenses WHERE id=$1 RETURNING id', [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ error: 'Expense not found' });
    res.json({ deleted: result.rows[0].id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// ---------------------------------------------------------------------------
// Start server — initialize schema on first boot if tables are missing
// ---------------------------------------------------------------------------
async function initDb() {
  // Initial schema bootstrap — only runs if tables don't exist yet
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
  } catch (err) {
    console.error('Schema bootstrap failed:', err.message);
    // Can't proceed without tables — but don't crash the server
  }

  // Migrations for legacy databases — each runs independently so one failure
  // doesn't prevent the rest from executing.
  const schemaUpgrades = [
    "ALTER TABLE employees ADD COLUMN IF NOT EXISTS phone_mobile TEXT",
    "ALTER TABLE employees ADD COLUMN IF NOT EXISTS address TEXT",
    "ALTER TABLE employees ADD COLUMN IF NOT EXISTS city TEXT",
    "ALTER TABLE employees ADD COLUMN IF NOT EXISTS postal_code TEXT",
    "ALTER TABLE employees ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'Luxembourg'",
    "ALTER TABLE employees ADD COLUMN IF NOT EXISTS start_date DATE",
    "ALTER TABLE employees ADD COLUMN IF NOT EXISTS contract_type TEXT DEFAULT 'CDI'",
    "ALTER TABLE employees ADD COLUMN IF NOT EXISTS contract_end_date DATE",
    "ALTER TABLE employees ADD COLUMN IF NOT EXISTS bank_iban TEXT",
    "ALTER TABLE employees ADD COLUMN IF NOT EXISTS social_sec_number TEXT",
    "ALTER TABLE employees ADD COLUMN IF NOT EXISTS date_of_birth DATE",
    "ALTER TABLE employees ADD COLUMN IF NOT EXISTS nationality TEXT",
    "ALTER TABLE employees ADD COLUMN IF NOT EXISTS languages TEXT",
    "ALTER TABLE employees ADD COLUMN IF NOT EXISTS transport TEXT",
    "ALTER TABLE employees ADD COLUMN IF NOT EXISTS work_permit TEXT",
    "ALTER TABLE employees ADD COLUMN IF NOT EXISTS emergency_name TEXT",
    "ALTER TABLE employees ADD COLUMN IF NOT EXISTS emergency_phone TEXT",
    "ALTER TABLE employees ADD COLUMN IF NOT EXISTS notes TEXT",
    "ALTER TABLE employees ADD COLUMN IF NOT EXISTS username TEXT DEFAULT ''",
    "ALTER TABLE employees ADD COLUMN IF NOT EXISTS password_hash TEXT",
    "ALTER TABLE employees ADD COLUMN IF NOT EXISTS email_verified BOOLEAN NOT NULL DEFAULT false",
    "ALTER TABLE employees ADD COLUMN IF NOT EXISTS account_status TEXT NOT NULL DEFAULT 'approved'",
    "ALTER TABLE employees ADD COLUMN IF NOT EXISTS weekly_hours NUMERIC(10,2) DEFAULT 0",

    "ALTER TABLE clients ADD COLUMN IF NOT EXISTS contact_person TEXT",
    "ALTER TABLE clients ADD COLUMN IF NOT EXISTS phone_mobile TEXT",
    "ALTER TABLE clients ADD COLUMN IF NOT EXISTS apartment_floor TEXT",
    "ALTER TABLE clients ADD COLUMN IF NOT EXISTS billing_type TEXT DEFAULT 'hourly'",
    "ALTER TABLE clients ADD COLUMN IF NOT EXISTS price_fixed NUMERIC(10,2) DEFAULT 0",
    "ALTER TABLE clients ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'FR'",
    "ALTER TABLE clients ADD COLUMN IF NOT EXISTS access_code TEXT",
    "ALTER TABLE clients ADD COLUMN IF NOT EXISTS key_location TEXT",
    "ALTER TABLE clients ADD COLUMN IF NOT EXISTS parking_info TEXT",
    "ALTER TABLE clients ADD COLUMN IF NOT EXISTS pet_info TEXT",
    "ALTER TABLE clients ADD COLUMN IF NOT EXISTS preferred_day TEXT",
    "ALTER TABLE clients ADD COLUMN IF NOT EXISTS preferred_time TEXT",
    "ALTER TABLE clients ADD COLUMN IF NOT EXISTS contract_start DATE",
    "ALTER TABLE clients ADD COLUMN IF NOT EXISTS contract_end DATE",
    "ALTER TABLE clients ADD COLUMN IF NOT EXISTS square_meters NUMERIC(10,2)",
    "ALTER TABLE clients ADD COLUMN IF NOT EXISTS tax_id TEXT",
    "ALTER TABLE clients ADD COLUMN IF NOT EXISTS special_instructions TEXT",
    "ALTER TABLE clients ADD COLUMN IF NOT EXISTS notes TEXT",
    "ALTER TABLE clients ADD COLUMN IF NOT EXISTS meta JSONB NOT NULL DEFAULT '{}'::jsonb",
    "ALTER TABLE schedules ADD COLUMN IF NOT EXISTS payment_status TEXT NOT NULL DEFAULT 'unpaid'",
    "ALTER TABLE payslips ADD COLUMN IF NOT EXISTS period_start DATE",
    "ALTER TABLE payslips ADD COLUMN IF NOT EXISTS period_end DATE",
    "ALTER TABLE payslips ADD COLUMN IF NOT EXISTS hour_breakdown JSONB NOT NULL DEFAULT '[]'",

    // Legacy prospect_visits tables were created before all columns existed.
    // Ensure inserts from VisitationPage keep working on older databases.
    "ALTER TABLE prospect_visits ADD COLUMN IF NOT EXISTS visit_time TEXT",
    "ALTER TABLE prospect_visits ADD COLUMN IF NOT EXISTS address TEXT",
    "ALTER TABLE prospect_visits ADD COLUMN IF NOT EXISTS notes TEXT",
    "ALTER TABLE prospect_visits ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'planned'",
    "ALTER TABLE prospect_visits ADD COLUMN IF NOT EXISTS photos JSONB DEFAULT '[]'",
    "ALTER TABLE prospect_visits ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ",
    "ALTER TABLE prospect_visits ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()",
  ];

  for (const sql of schemaUpgrades) {
    try {
      await pool.query(sql);
    } catch (err) {
      console.error('Migration skipped (will retry on next restart):', err.message, '|', sql);
    }
  }

  try {
    await pool.query("CREATE UNIQUE INDEX IF NOT EXISTS idx_employees_email_unique ON employees(LOWER(email))");
  } catch (err) {
    console.error('Email unique index creation failed (possible duplicate emails in DB):', err.message);
  }

  try {
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
  } catch (err) {
    console.error('account_requests table creation failed:', err.message);
  }

  try {
    await pool.query("INSERT INTO settings (key, value) VALUES ('ownerEmail', 'owner@luxangels.lu') ON CONFLICT (key) DO NOTHING");
  } catch (err) {
    console.error('Settings seed failed:', err.message);
  }

  // New tables for data previously stored only in browser memory
  const newTables = [
    `CREATE TABLE IF NOT EXISTS quotes (
      id TEXT PRIMARY KEY, quote_number TEXT NOT NULL UNIQUE, date DATE NOT NULL,
      client_id TEXT REFERENCES clients(id) ON DELETE SET NULL,
      status TEXT NOT NULL DEFAULT 'draft', items JSONB NOT NULL DEFAULT '[]',
      subtotal NUMERIC(10,2) NOT NULL DEFAULT 0, vat_rate NUMERIC(5,2) NOT NULL DEFAULT 17,
      vat_amount NUMERIC(10,2) NOT NULL DEFAULT 0, total NUMERIC(10,2) NOT NULL DEFAULT 0,
      notes TEXT, pricing_mode TEXT DEFAULT 'hours', job_schedule JSONB DEFAULT '{}',
      visible_columns JSONB DEFAULT '{}', created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`,
    `CREATE TABLE IF NOT EXISTS photo_uploads (
      id TEXT PRIMARY KEY, employee_id TEXT REFERENCES employees(id) ON DELETE SET NULL,
      client_id TEXT REFERENCES clients(id) ON DELETE SET NULL, clock_entry_id TEXT,
      file_name TEXT, image_data TEXT, note TEXT, type TEXT DEFAULT 'issue',
      seen_by_owner BOOLEAN NOT NULL DEFAULT FALSE, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`,
    `CREATE TABLE IF NOT EXISTS time_off_requests (
      id TEXT PRIMARY KEY, employee_id TEXT REFERENCES employees(id) ON DELETE SET NULL,
      start_date DATE NOT NULL, end_date DATE NOT NULL, requested_days NUMERIC(6,2) NOT NULL DEFAULT 1,
      reason TEXT, leave_type TEXT DEFAULT 'conge', status TEXT NOT NULL DEFAULT 'pending',
      reviewed_at TIMESTAMPTZ, reviewed_by TEXT, review_note TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`,
    `CREATE TABLE IF NOT EXISTS inventory_products (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, unit TEXT DEFAULT 'bottles',
      stock NUMERIC(10,2) NOT NULL DEFAULT 0, min_stock NUMERIC(10,2) NOT NULL DEFAULT 0,
      note TEXT, active BOOLEAN NOT NULL DEFAULT TRUE, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`,
    `CREATE TABLE IF NOT EXISTS product_requests (
      id TEXT PRIMARY KEY, employee_id TEXT REFERENCES employees(id) ON DELETE SET NULL,
      product_id TEXT REFERENCES inventory_products(id) ON DELETE SET NULL,
      quantity NUMERIC(10,2) NOT NULL DEFAULT 1, note TEXT, delivery_at TEXT,
      status TEXT NOT NULL DEFAULT 'pending', approved_qty NUMERIC(10,2) DEFAULT 0,
      delivered_qty NUMERIC(10,2) DEFAULT 0, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`,
    `CREATE TABLE IF NOT EXISTS cleaner_product_holdings (
      id TEXT PRIMARY KEY, employee_id TEXT REFERENCES employees(id) ON DELETE SET NULL,
      product_id TEXT REFERENCES inventory_products(id) ON DELETE SET NULL,
      qty_in_hand NUMERIC(10,2) NOT NULL DEFAULT 0,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`,
    `CREATE TABLE IF NOT EXISTS prospect_visits (
      id TEXT PRIMARY KEY, client_id TEXT REFERENCES clients(id) ON DELETE SET NULL,
      visit_date DATE NOT NULL, visit_time TEXT, address TEXT, notes TEXT,
      status TEXT NOT NULL DEFAULT 'planned', photos JSONB DEFAULT '[]',
      updated_at TIMESTAMPTZ, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`,
    `CREATE TABLE IF NOT EXISTS expenses (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, amount NUMERIC(10,2) NOT NULL DEFAULT 0,
      due_day INTEGER NOT NULL DEFAULT 1, category TEXT DEFAULT 'other', note TEXT,
      is_active BOOLEAN NOT NULL DEFAULT TRUE, payments JSONB NOT NULL DEFAULT '[]',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`,
  ];
  for (const sql of newTables) {
    try { await pool.query(sql); } catch (err) { console.error('New table creation failed:', err.message); }
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
