import { AppError } from '../errors.js';
import { config } from '../config.js';

const buckets = new Map();

export function enforceRateLimit(ip) {
  const now = Date.now();
  const bucket = buckets.get(ip) ?? [];
  const active = bucket.filter((ts) => now - ts <= config.rateLimitWindowMs);

  if (active.length >= config.rateLimitMax) {
    throw new AppError(429, 'RATE_LIMITED', 'Too many requests');
  }

  active.push(now);
  buckets.set(ip, active);
}
