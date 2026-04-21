#!/usr/bin/env node
/**
 * Email functionality test script for Lux Angels backend.
 * Tests email gateway detection, token hashing, and optionally sends a real test email.
 * Usage: node test-email.js [recipient@example.com]
 *
 * Set env vars to test a real send:
 *   SMTP:      EMAIL_PROVIDER=smtp SMTP_HOST=... SMTP_USER=... SMTP_PASS=...
 *   ZeptoMail: EMAIL_PROVIDER=zeptomail ZEPTO_API_TOKEN=... (ZEPTO_FROM_ADDRESS=...)
 *   Resend:    EMAIL_PROVIDER=resend RESEND_API_KEY=... (RESEND_FROM=...)
 */

require('dotenv').config();
const crypto = require('crypto');
const https = require('https');
const http = require('http');

// ── helpers (mirrors app.js) ────────────────────────────────────────────────

const normalizeEmail = (v) => String(v || '').trim().toLowerCase();
const hashToken = (token) => crypto.createHash('sha256').update(String(token)).digest('hex');
const makeToken = () => crypto.randomBytes(32).toString('hex');

const getEmailGateway = (dbSettings = {}) => {
  const provider = String(process.env.EMAIL_PROVIDER || dbSettings.emailProvider || '').trim().toLowerCase();
  const zeptoToken = String(process.env.ZEPTO_API_TOKEN || dbSettings.zeptoApiToken || '').trim();
  const resendKey  = String(process.env.RESEND_API_KEY  || dbSettings.resendApiKey  || '').trim();
  const smtpUser   = String(process.env.SMTP_USER || dbSettings.smtpUser || '').trim();
  const smtpPass   = String(process.env.SMTP_PASS || dbSettings.smtpPass || '').trim();

  if (provider === 'smtp' || (!provider && smtpUser && smtpPass)) {
    return {
      provider: 'smtp',
      host:   String(process.env.SMTP_HOST   || dbSettings.smtpHost   || 'mail.infomaniak.com').trim(),
      port:   parseInt(process.env.SMTP_PORT || dbSettings.smtpPort   || '465', 10),
      secure: (process.env.SMTP_SECURE || dbSettings.smtpSecure || 'true').trim().toLowerCase() !== 'false',
      user: smtpUser,
      pass: smtpPass,
    };
  }
  if (provider === 'zeptomail' || (!provider && zeptoToken)) {
    return {
      provider: 'zeptomail',
      url:   String(process.env.ZEPTO_API_URL || dbSettings.zeptoApiUrl || 'https://api.zeptomail.eu/v1.1/email').trim(),
      token: zeptoToken,
    };
  }
  if (provider === 'resend' || (!provider && resendKey)) {
    return {
      provider: 'resend',
      url:   'https://api.resend.com/emails',
      token: resendKey,
    };
  }
  return null;
};

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
          res.on('data', (chunk) => { responseBody += chunk; });
          res.on('end', () => { resolve({ ok: res.statusCode >= 200 && res.statusCode < 300, status: res.statusCode, body: responseBody }); });
        }
      );
      req.on('error', reject);
      req.write(payload);
      req.end();
    } catch (err) { reject(err); }
  });

async function sendEmailDirect({ to, subject, body, html, from, gateway, senderEmail, senderName }) {
  if (gateway.provider === 'smtp') {
    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransport({
      host: gateway.host,
      port: gateway.port,
      secure: gateway.secure,
      auth: { user: gateway.user, pass: gateway.pass },
    });
    await transporter.sendMail({
      from: `"${senderName}" <${gateway.user}>`,
      to,
      subject,
      text: body || undefined,
      html: html || undefined,
      replyTo: gateway.user,
    });
    return { ok: true, provider: 'smtp' };
  }

  if (gateway.provider === 'zeptomail') {
    const response = await postJson(gateway.url, {
      headers: { Authorization: `Zoho-enczapikey ${gateway.token}` },
      body: {
        from: { address: senderEmail, name: senderName },
        to: [{ email_address: { address: to } }],
        subject,
        textbody: body || undefined,
        htmlbody: html || undefined,
        reply_to: [{ address: senderEmail }],
      },
    });
    if (!response.ok) throw new Error(`ZeptoMail ${response.status}: ${response.body}`);
    return { ok: true, provider: 'zeptomail' };
  }

  // resend
  const response = await postJson(gateway.url, {
    headers: { Authorization: `Bearer ${gateway.token}` },
    body: {
      from: `${senderName} <${senderEmail}>`,
      to: [to],
      subject,
      text: body || undefined,
      html: html || undefined,
      reply_to: [senderEmail],
    },
  });
  if (!response.ok) throw new Error(`Resend ${response.status}: ${response.body}`);
  return { ok: true, provider: 'resend' };
}

// ── test harness ─────────────────────────────────────────────────────────────

let passed = 0;
let failed = 0;

function assert(condition, label, detail = '') {
  if (condition) {
    console.log(`  ✓  ${label}`);
    passed++;
  } else {
    console.error(`  ✗  ${label}${detail ? ` — ${detail}` : ''}`);
    failed++;
  }
}

// ── test suites ───────────────────────────────────────────────────────────────

function testTokenHelpers() {
  console.log('\n[1] Token / hashing helpers');

  const token = makeToken();
  assert(typeof token === 'string' && token.length === 64, 'makeToken() produces a 64-char hex string', `got length ${token.length}`);

  const hash = hashToken(token);
  assert(typeof hash === 'string' && hash.length === 64, 'hashToken() produces a 64-char hex string');
  assert(hashToken(token) === hash, 'hashToken() is deterministic');
  assert(hashToken(token + 'x') !== hash, 'hashToken() is sensitive to input changes');

  const norm = normalizeEmail('  User@Example.COM  ');
  assert(norm === 'user@example.com', 'normalizeEmail() trims and lowercases');
}

function testGatewayDetection() {
  console.log('\n[2] getEmailGateway() detection logic');

  // No config → null
  const saved = { ...process.env };
  ['EMAIL_PROVIDER','SMTP_USER','SMTP_PASS','SMTP_HOST','SMTP_PORT','SMTP_SECURE',
   'ZEPTO_API_TOKEN','ZEPTO_API_URL','RESEND_API_KEY'].forEach(k => delete process.env[k]);

  assert(getEmailGateway() === null, 'Returns null when no provider is configured');

  // SMTP via env
  process.env.SMTP_USER = 'test@example.com';
  process.env.SMTP_PASS = 'secret';
  const smtpGw = getEmailGateway();
  assert(smtpGw?.provider === 'smtp', 'Auto-detects SMTP when SMTP_USER + SMTP_PASS are set');
  assert(smtpGw?.user === 'test@example.com', 'SMTP gateway carries correct user');
  assert(smtpGw?.port === 465, 'SMTP defaults to port 465');
  assert(smtpGw?.secure === true, 'SMTP defaults to secure=true');
  delete process.env.SMTP_USER;
  delete process.env.SMTP_PASS;

  // ZeptoMail via env
  process.env.ZEPTO_API_TOKEN = 'zepto-key-123';
  const zeptoGw = getEmailGateway();
  assert(zeptoGw?.provider === 'zeptomail', 'Auto-detects ZeptoMail when ZEPTO_API_TOKEN is set');
  assert(zeptoGw?.token === 'zepto-key-123', 'ZeptoMail gateway carries correct token');
  delete process.env.ZEPTO_API_TOKEN;

  // Resend via env
  process.env.RESEND_API_KEY = 're_abc123';
  const resendGw = getEmailGateway();
  assert(resendGw?.provider === 'resend', 'Auto-detects Resend when RESEND_API_KEY is set');
  delete process.env.RESEND_API_KEY;

  // Explicit provider overrides auto-detect
  process.env.EMAIL_PROVIDER = 'smtp';
  process.env.SMTP_USER = 'u@domain.com';
  process.env.SMTP_PASS = 'p';
  process.env.ZEPTO_API_TOKEN = 'should-be-ignored';
  const explicit = getEmailGateway();
  assert(explicit?.provider === 'smtp', 'EMAIL_PROVIDER=smtp takes precedence over ZEPTO_API_TOKEN');
  delete process.env.EMAIL_PROVIDER;
  delete process.env.SMTP_USER;
  delete process.env.SMTP_PASS;
  delete process.env.ZEPTO_API_TOKEN;

  // DB settings fallback
  const dbOnlyGw = getEmailGateway({ emailProvider: 'resend', resendApiKey: 're_db_key' });
  assert(dbOnlyGw?.provider === 'resend', 'Falls back to DB settings when no env vars set');
  assert(dbOnlyGw?.token === 're_db_key', 'DB resend key is used correctly');

  // Restore env
  Object.keys(saved).forEach(k => { process.env[k] = saved[k]; });
}

function testEmailTemplates() {
  console.log('\n[3] Email template builder');

  const buildEmailBody = (inv, client, template) => {
    const clientName = client?.name || 'Client';
    const invoiceNumber = inv?.invoice_number || inv?.id || 'N/A';
    const invoiceDate = inv?.date ? new Date(inv.date).toLocaleDateString('en-GB') : 'N/A';
    const totalAmount = typeof inv?.total_amount === 'number' ? inv.total_amount.toFixed(2) : (inv?.total_amount || '0.00');
    switch (template) {
      case 'friendly':
        return `Hello ${clientName},\n\nPlease find your invoice ${invoiceNumber} for cleaning services on ${invoiceDate}.\nAmount due: €${totalAmount}\n\nFeel free to reach out if you have any questions.`;
      case 'thankyou':
        return `Dear ${clientName},\n\nThank you for choosing Lux Angels Cleaning!\n\nPlease find attached invoice ${invoiceNumber} dated ${invoiceDate}.\nTotal: €${totalAmount}\n\nWe appreciate your trust and look forward to serving you again.`;
      case 'overdue':
        return `Dear ${clientName},\n\nThis is a reminder that invoice ${invoiceNumber} dated ${invoiceDate} is now overdue.\nOutstanding amount: €${totalAmount}\n\nPlease arrange payment at your earliest convenience. Contact us if you have already settled this invoice.`;
      default:
        return `Dear ${clientName},\n\nInvoice: ${invoiceNumber}\nDate: ${invoiceDate}\nTotal: €${totalAmount}\n\nPlease find your invoice details above.`;
    }
  };

  const inv = { invoice_number: 'INV-001', date: '2024-01-15', total_amount: 150 };
  const client = { name: 'Jane Doe' };

  const standard = buildEmailBody(inv, client, 'standard');
  assert(standard.includes('Jane Doe'), 'Standard template includes client name');
  assert(standard.includes('INV-001'), 'Standard template includes invoice number');
  assert(standard.includes('€150.00'), 'Standard template formats amount correctly');

  const friendly = buildEmailBody(inv, client, 'friendly');
  assert(friendly.toLowerCase().includes('hello'), 'Friendly template starts with "Hello"');

  const overdue = buildEmailBody(inv, client, 'overdue');
  assert(overdue.toLowerCase().includes('overdue'), 'Overdue template contains "overdue"');

  const missingClient = buildEmailBody(inv, null, 'standard');
  assert(missingClient.includes('Client'), 'Falls back to "Client" when client is null');
}

async function testLiveEmailSend(recipient) {
  console.log(`\n[4] Live email send → ${recipient}`);

  const gateway = getEmailGateway();
  if (!gateway) {
    console.log('  ⚠  No email provider configured — skipping live send test.');
    console.log('     Set SMTP_USER+SMTP_PASS, ZEPTO_API_TOKEN, or RESEND_API_KEY to enable.');
    return;
  }

  console.log(`     Provider detected: ${gateway.provider}`);
  if (gateway.provider === 'smtp') {
    console.log(`     SMTP host: ${gateway.host}:${gateway.port} (secure=${gateway.secure}, user=${gateway.user})`);
  }

  const senderEmail =
    process.env.SMTP_USER ||
    process.env.ZEPTO_FROM_ADDRESS ||
    process.env.RESEND_FROM ||
    'info@luxangels.lu';

  try {
    const result = await sendEmailDirect({
      to: recipient,
      subject: 'Lux Angels — email functionality test',
      body: 'This is a test email sent by the automated email test script.\n\nIf you received this, email is working correctly!',
      html: '<p>This is a <strong>test email</strong> sent by the automated email test script.</p><p>If you received this, <strong>email is working correctly!</strong></p>',
      gateway,
      senderEmail,
      senderName: 'Lux Angels Test',
    });
    assert(result.ok === true, `Email sent successfully via ${result.provider}`);
    console.log(`     → Check ${recipient} inbox for the test message.`);
  } catch (err) {
    assert(false, 'Live email send', err.message);
  }
}

// ── verification flow simulation ──────────────────────────────────────────────

function testVerificationFlow() {
  console.log('\n[5] Email verification flow simulation');

  const token = makeToken();
  const hash = hashToken(token);
  const FRONTEND_URL = process.env.FRONTEND_URL || 'https://luxangelsyamyam-frontend.onrender.com';
  const email = 'employee@example.com';
  const verifyUrl = `${FRONTEND_URL.replace(/\/$/, '')}/verify-email?email=${encodeURIComponent(email)}&token=${token}`;

  assert(verifyUrl.includes('/verify-email'), 'Verification URL has correct path');
  assert(verifyUrl.includes(encodeURIComponent(email)), 'Verification URL encodes email');
  assert(verifyUrl.includes(token), 'Verification URL contains token');

  // Simulate token validation (as in /api/auth/verify-email)
  const incomingToken = token;
  const storedHash = hash;
  const isValid = hashToken(incomingToken) === storedHash;
  assert(isValid, 'Token validation: correct token passes');

  const tamperedToken = token.slice(0, -1) + (token.slice(-1) === 'a' ? 'b' : 'a');
  const isInvalid = hashToken(tamperedToken) !== storedHash;
  assert(isInvalid, 'Token validation: tampered token is rejected');
}

// ── main ─────────────────────────────────────────────────────────────────────

(async () => {
  console.log('='.repeat(60));
  console.log(' Lux Angels — Email Functionality Tests');
  console.log('='.repeat(60));

  testTokenHelpers();
  testGatewayDetection();
  testEmailTemplates();
  testVerificationFlow();

  const recipient = process.argv[2];
  if (recipient) {
    await testLiveEmailSend(recipient);
  } else {
    console.log('\n[4] Live email send — skipped (no recipient provided)');
    console.log('     Run:  node test-email.js recipient@example.com  to send a real test email.');
  }

  console.log('\n' + '='.repeat(60));
  console.log(` Results: ${passed} passed, ${failed} failed`);
  console.log('='.repeat(60));

  if (failed > 0) {
    process.exit(1);
  }
})();
