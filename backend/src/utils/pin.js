'use strict';

const crypto = require('crypto');

const SCRYPT_N = 16384;
const SCRYPT_R = 8;
const SCRYPT_P = 1;
const KEY_LEN = 64;
const SALT_LEN = 16;

/**
 * Hash a PIN using scrypt.
 * @param {string} pin  Plain-text PIN
 * @returns {{ salt: string, hash: string }}
 */
function hashPin(pin) {
  const salt = crypto.randomBytes(SALT_LEN).toString('hex');
  const hash = crypto
    .scryptSync(String(pin), salt, KEY_LEN, { N: SCRYPT_N, r: SCRYPT_R, p: SCRYPT_P })
    .toString('hex');
  return { salt, hash };
}

/**
 * Verify a plain-text PIN against a stored salt+hash.
 * @param {string} pin   Plain-text PIN to verify
 * @param {string} salt  Stored salt (hex)
 * @param {string} hash  Stored hash (hex)
 * @returns {boolean}
 */
function verifyPin(pin, salt, hash) {
  const candidate = crypto
    .scryptSync(String(pin), salt, KEY_LEN, { N: SCRYPT_N, r: SCRYPT_R, p: SCRYPT_P })
    .toString('hex');
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(candidate, 'hex'));
}

module.exports = { hashPin, verifyPin };
