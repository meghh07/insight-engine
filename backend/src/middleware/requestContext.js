import { randomUUID } from 'node:crypto';

export function buildRequestContext(req) {
  const requestId = req.headers['x-request-id'] || randomUUID();
  return {
    requestId,
    startedAt: Date.now(),
    ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown'
  };
}
