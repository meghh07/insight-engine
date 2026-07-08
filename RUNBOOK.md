# Insight Engine Runbook

## Health checks
- Liveness: `GET /health/live`
- Readiness: `GET /health/ready`
- Metrics: `GET /metrics`

## Incident response
1. Check application logs for `request.failed` entries and request IDs.
2. Validate upstream reachability to CoinGecko.
3. Confirm `AUTH_*` and `ALLOWED_ORIGINS` environment variables.
4. If provider is unstable, stale cache responses are expected on market/signal APIs.

## Deployment
- Local container: `docker compose -f deployment/docker-compose.yml up --build`
- CI pipeline enforces lint, tests, build, and CodeQL on PRs.
