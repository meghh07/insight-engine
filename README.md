# Insight Engine (Production Baseline)

Production-ready baseline for a market intelligence platform with secure API boundaries, observability hooks, and CI/CD automation.

## Architecture
- `frontend/`: browser UI
- `backend/src/`: API server (auth, market, signals, alerts, settings, analytics)
- `shared/`: request/response contracts
- `tests/`: contract, service, and integration tests
- `.github/workflows/`: CI + CodeQL

## Quick start
```bash
cp .env.example .env
npm run start
```

Open `http://localhost:3000`.

## Security baseline
- No hardcoded secrets in source files
- CORS allow-list from environment
- Basic rate limiting
- Secure response headers (CSP, X-Frame-Options, etc.)
- Standardized error payload with request IDs

## API highlights
- `POST /api/v1/auth/login`
- `GET /api/v1/market/:symbol`
- `GET /api/v1/signals/:symbol`
- `GET|POST|DELETE /api/v1/alerts`
- `GET|PUT /api/v1/settings`
- `POST /api/v1/analytics/event`
- `GET /api/v1/analytics/summary`
