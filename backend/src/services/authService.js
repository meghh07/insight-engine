import { randomUUID, timingSafeEqual } from 'node:crypto';
import { config } from '../config.js';
import { AppError } from '../errors.js';

const tokens = new Map();

function safeEqual(a, b) {
  const aa = Buffer.from(a);
  const bb = Buffer.from(b);
  if (aa.length !== bb.length) return false;
  return timingSafeEqual(aa, bb);
}

export function login(username, password) {
  if (!safeEqual(username, config.authUsername) || !safeEqual(password, config.authPassword)) {
    throw new AppError(401, 'AUTH_INVALID', 'Invalid credentials');
  }

  const token = randomUUID();
  const expiresAt = Date.now() + config.tokenTtlSeconds * 1000;
  tokens.set(token, { userId: username, expiresAt });

  return {
    token,
    tokenType: 'Bearer',
    expiresAt: new Date(expiresAt).toISOString()
  };
}

export function verifyToken(headerValue) {
  const token = String(headerValue || '').replace(/^Bearer\s+/i, '').trim();
  if (!token) throw new AppError(401, 'AUTH_REQUIRED', 'Authentication required');

  const session = tokens.get(token);
  if (!session || session.expiresAt < Date.now()) {
    tokens.delete(token);
    throw new AppError(401, 'AUTH_INVALID', 'Invalid or expired token');
  }

  return session;
}
