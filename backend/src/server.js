import { createServer as createHttpServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { config } from './config.js';
import { log } from './logger.js';
import { toErrorResponse } from './errors.js';
import { sendJson } from './utils/json.js';
import { applySecurityHeaders, enforceCors } from './middleware/security.js';
import { buildRequestContext } from './middleware/requestContext.js';
import { enforceRateLimit } from './middleware/rateLimit.js';
import { routeRequest } from './router.js';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const frontendDir = join(__dirname, '../../frontend');

const mimeByExt = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8'
};

async function serveStatic(pathname, res) {
  const route = pathname === '/' ? '/index.html' : pathname;
  const filePath = join(frontendDir, route);
  const data = await readFile(filePath);
  const ext = extname(filePath);
  res.writeHead(200, { 'content-type': mimeByExt[ext] ?? 'application/octet-stream' });
  res.end(data);
}

export function createAppServer() {
  return createHttpServer(async (req, res) => {
    const context = buildRequestContext(req);
    res.setHeader('x-request-id', context.requestId);

    try {
      applySecurityHeaders(res);
      enforceCors(req, res);
      enforceRateLimit(context.ip);

      if (req.method === 'OPTIONS') {
        res.writeHead(204);
        return res.end();
      }

      const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);

      if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/health/') || url.pathname === '/metrics') {
        await routeRequest(req, res, url, context);
      } else {
        await serveStatic(url.pathname, res);
      }

      log('info', 'request.completed', {
        requestId: context.requestId,
        method: req.method,
        path: url.pathname,
        durationMs: Date.now() - context.startedAt,
        status: res.statusCode
      });
    } catch (err) {
      const failure = toErrorResponse(err, context.requestId);
      sendJson(res, failure.status, failure.body);
      log('error', 'request.failed', {
        requestId: context.requestId,
        method: req.method,
        path: req.url,
        durationMs: Date.now() - context.startedAt,
        status: failure.status,
        errorCode: failure.body.error.code,
        errorMessage: failure.body.error.message
      });
    }
  });
}

const isMainModule = process.argv[1] && process.argv[1].endsWith('/backend/src/server.js');

if (isMainModule) {
  const server = createAppServer();
  server.listen(config.port, () => {
    log('info', 'server.started', { port: config.port, env: config.nodeEnv });
  });
}
