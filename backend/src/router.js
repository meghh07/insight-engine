import { AppError } from './errors.js';
import { readJsonBody, sendJson } from './utils/json.js';
import { assertSchema } from './utils/validate.js';
import { schemas } from '../../shared/contracts.js';
import { login, verifyToken } from './services/authService.js';
import { getMarketQuote } from './services/marketService.js';
import { deriveSignal } from './services/signalService.js';
import { listAlerts, createAlert, removeAlert } from './services/alertService.js';
import { getSettings, updateSettings } from './services/settingsService.js';
import { trackEvent, getSummary } from './services/analyticsService.js';

function parsePath(pathname) {
  return pathname.split('/').filter(Boolean);
}

function requiresAuth(pathname) {
  return /^\/api\/v1\/(alerts|settings|analytics\/summary)/.test(pathname);
}

export async function routeRequest(req, res, url, context) {
  const method = req.method || 'GET';
  const pathname = url.pathname;

  let session = null;
  if (requiresAuth(pathname)) {
    session = verifyToken(req.headers.authorization);
  }

  if (pathname === '/health/live' && method === 'GET') {
    return sendJson(res, 200, { status: 'ok', service: 'insight-engine' });
  }

  if (pathname === '/health/ready' && method === 'GET') {
    return sendJson(res, 200, { status: 'ready' });
  }

  if (pathname === '/metrics' && method === 'GET') {
    const body = `# TYPE insight_engine_requests_total counter\ninsight_engine_requests_total 1\n`;
    res.writeHead(200, { 'content-type': 'text/plain; version=0.0.4' });
    return res.end(body);
  }

  if (pathname === '/api/v1/auth/login' && method === 'POST') {
    const payload = await readJsonBody(req);
    assertSchema(schemas.loginRequest, payload);
    const auth = login(payload.username, payload.password);
    return sendJson(res, 200, { data: auth, requestId: context.requestId });
  }

  const parts = parsePath(pathname);

  if (parts[0] === 'api' && parts[1] === 'v1' && parts[2] === 'market' && parts[3] && method === 'GET') {
    const symbol = parts[3].toUpperCase();
    const quote = await getMarketQuote(symbol);
    return sendJson(res, 200, { data: quote, requestId: context.requestId });
  }

  if (parts[0] === 'api' && parts[1] === 'v1' && parts[2] === 'signals' && parts[3] && method === 'GET') {
    const symbol = parts[3].toUpperCase();
    const quote = await getMarketQuote(symbol);
    const signal = deriveSignal(quote);
    return sendJson(res, 200, { data: signal, requestId: context.requestId });
  }

  if (pathname === '/api/v1/alerts' && method === 'GET') {
    return sendJson(res, 200, { data: listAlerts(session.userId), requestId: context.requestId });
  }

  if (pathname === '/api/v1/alerts' && method === 'POST') {
    const payload = await readJsonBody(req);
    assertSchema(schemas.alertRequest, payload);
    const created = createAlert(session.userId, payload);
    return sendJson(res, 201, { data: created, requestId: context.requestId });
  }

  if (parts[0] === 'api' && parts[1] === 'v1' && parts[2] === 'alerts' && parts[3] && method === 'DELETE') {
    const removed = removeAlert(session.userId, parts[3]);
    if (!removed) throw new AppError(404, 'ALERT_NOT_FOUND', 'Alert not found');
    return sendJson(res, 200, { data: { removed: true }, requestId: context.requestId });
  }

  if (pathname === '/api/v1/settings' && method === 'GET') {
    return sendJson(res, 200, { data: getSettings(session.userId), requestId: context.requestId });
  }

  if (pathname === '/api/v1/settings' && method === 'PUT') {
    const payload = await readJsonBody(req);
    assertSchema(schemas.settingsRequest, payload);
    return sendJson(res, 200, { data: updateSettings(session.userId, payload), requestId: context.requestId });
  }

  if (pathname === '/api/v1/analytics/event' && method === 'POST') {
    const payload = await readJsonBody(req);
    assertSchema(schemas.analyticsEvent, payload);
    trackEvent(payload, context.requestId);
    return sendJson(res, 202, { data: { accepted: true }, requestId: context.requestId });
  }

  if (pathname === '/api/v1/analytics/summary' && method === 'GET') {
    return sendJson(res, 200, { data: getSummary(), requestId: context.requestId });
  }

  throw new AppError(404, 'NOT_FOUND', 'Resource not found');
}
