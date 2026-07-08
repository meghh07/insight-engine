function parseIntSafe(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export const config = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: parseIntSafe(process.env.PORT, 3000),
  allowedOrigins: (process.env.ALLOWED_ORIGINS ?? 'http://localhost:3000')
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean),
  rateLimitWindowMs: parseIntSafe(process.env.RATE_LIMIT_WINDOW_MS, 60_000),
  rateLimitMax: parseIntSafe(process.env.RATE_LIMIT_MAX, 120),
  authUsername: process.env.AUTH_USERNAME ?? 'admin',
  authPassword: process.env.AUTH_PASSWORD ?? 'change-me',
  tokenTtlSeconds: parseIntSafe(process.env.TOKEN_TTL_SECONDS, 3600),
  providerTimeoutMs: 4_000,
  providerRetries: 2,
  breakerFailureThreshold: 3,
  breakerCooldownMs: 15_000
};
