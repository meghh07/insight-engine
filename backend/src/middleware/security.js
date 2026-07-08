import { AppError } from '../errors.js';
import { config } from '../config.js';

export function applySecurityHeaders(res) {
  res.setHeader('x-content-type-options', 'nosniff');
  res.setHeader('x-frame-options', 'DENY');
  res.setHeader('referrer-policy', 'strict-origin-when-cross-origin');
  res.setHeader('permissions-policy', 'geolocation=(), camera=(), microphone=()');
  res.setHeader('content-security-policy', "default-src 'self'; connect-src 'self'; img-src 'self' data:; style-src 'self'; script-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'");
}

export function enforceCors(req, res) {
  const origin = req.headers.origin;
  if (!origin) return;

  if (!config.allowedOrigins.includes(origin)) {
    throw new AppError(403, 'CORS_BLOCKED', 'Origin not allowed');
  }

  res.setHeader('access-control-allow-origin', origin);
  res.setHeader('vary', 'Origin');
  res.setHeader('access-control-allow-methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('access-control-allow-headers', 'content-type,authorization,x-request-id');
}
