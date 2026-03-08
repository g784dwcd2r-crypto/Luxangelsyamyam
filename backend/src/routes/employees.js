'use strict';

const { Router } = require('express');
const rateLimit = require('express-rate-limit');
const { z } = require('zod');
const { v4: uuidv4 } = require('uuid');
const { query } = require('../db');
const { hashPin, verifyPin } = require('../utils/pin');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = Router();

// Limit all employee route requests to 100 per 15 minutes per IP
const employeeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please try again later.' },
});

// Limit PIN change attempts to 10 per 15 minutes per IP
const pinChangeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many PIN change attempts. Please try again later.' },
});

// All employee routes: rate limit first, then authenticate
router.use(employeeLimiter);
router.use(requireAuth);

const createEmployeeSchema = z.object({
  name: z.string().min(1, 'name is required'),
  pin: z.string().min(4, 'PIN must be at least 4 characters'),
});

const updatePinSchema = z.object({
  newPin: z.string().min(4, 'newPin must be at least 4 characters'),
  oldPin: z.string().optional(),
});

/**
 * POST /api/employees
 * Owner only — create a new employee with a PIN.
 */
router.post('/', requireRole('owner'), async (req, res, next) => {
  try {
    const parsed = createEmployeeSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.errors.map((e) => e.message).join('; ') });
    }

    const { name, pin } = parsed.data;
    const { salt, hash } = hashPin(pin);
    const id = uuidv4();

    const result = await query(
      `INSERT INTO users (id, role, name, pin_hash, pin_salt)
       VALUES ($1, 'employee', $2, $3, $4)
       RETURNING id, role, name, created_at`,
      [id, name, hash, salt]
    );

    return res.status(201).json({ employee: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /api/employees/:id/pin
 * Owner can reset any employee PIN.
 * Employee can change their own PIN if they provide oldPin.
 */
router.put('/:id/pin', pinChangeLimiter, async (req, res, next) => {
  try {
    const { id } = req.params;
    const parsed = updatePinSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.errors.map((e) => e.message).join('; ') });
    }

    const { newPin, oldPin } = parsed.data;
    const isOwner = req.user.role === 'owner';
    const isSelf = req.user.sub === id;

    if (!isOwner && !isSelf) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    // Employees must supply their current PIN to change it
    if (!isOwner) {
      if (!oldPin) {
        return res.status(400).json({ error: 'oldPin is required to change your own PIN' });
      }

      const existing = await query(
        `SELECT pin_hash, pin_salt FROM users WHERE id = $1`,
        [id]
      );
      if (!existing.rows[0]) {
        return res.status(404).json({ error: 'Employee not found' });
      }

      const valid = verifyPin(oldPin, existing.rows[0].pin_salt, existing.rows[0].pin_hash);
      if (!valid) {
        return res.status(401).json({ error: 'Current PIN is incorrect' });
      }
    }

    const { salt, hash } = hashPin(newPin);
    const result = await query(
      `UPDATE users SET pin_hash = $1, pin_salt = $2, updated_at = now()
       WHERE id = $3 AND role = 'employee'
       RETURNING id, role, name, updated_at`,
      [hash, salt, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    return res.json({ employee: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/employees
 * Owner only — list all employees.
 */
router.get('/', requireRole('owner'), async (req, res, next) => {
  try {
    const result = await query(
      `SELECT id, role, name, created_at, updated_at FROM users WHERE role = 'employee' ORDER BY name`
    );
    return res.json({ employees: result.rows });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
