'use strict';

const { Router } = require('express');
const rateLimit = require('express-rate-limit');
const { z } = require('zod');
const { query } = require('../db');
const { verifyPin } = require('../utils/pin');
const { signToken } = require('../middleware/auth');

const router = Router();

// Limit PIN login attempts to 10 per 15 minutes per IP
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts. Please try again later.' },
});

const pinLoginSchema = z.object({
  role: z.enum(['owner', 'employee']),
  pin: z.string().min(4, 'PIN must be at least 4 characters'),
  employeeId: z.string().uuid('employeeId must be a valid UUID').optional(),
});

/**
 * POST /api/auth/pin-login
 * Body: { role, pin, employeeId? }
 * Returns: { token, user: { id, role, name } }
 */
router.post('/pin-login', loginLimiter, async (req, res, next) => {
  try {
    const parsed = pinLoginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.errors.map((e) => e.message).join('; ') });
    }

    const { role, pin, employeeId } = parsed.data;

    let userRow;

    if (role === 'owner') {
      const result = await query(
        `SELECT id, role, name, pin_hash, pin_salt FROM users WHERE role = 'owner' LIMIT 1`
      );
      userRow = result.rows[0];
    } else {
      if (!employeeId) {
        return res.status(400).json({ error: 'employeeId is required for employee login' });
      }
      const result = await query(
        `SELECT id, role, name, pin_hash, pin_salt FROM users WHERE id = $1 AND role = 'employee'`,
        [employeeId]
      );
      userRow = result.rows[0];
    }

    if (!userRow) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const valid = verifyPin(pin, userRow.pin_salt, userRow.pin_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = signToken({ id: userRow.id, role: userRow.role, name: userRow.name });
    return res.json({
      token,
      user: { id: userRow.id, role: userRow.role, name: userRow.name },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
