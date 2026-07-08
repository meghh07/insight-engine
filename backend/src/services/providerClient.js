import { AppError } from '../errors.js';
import { config } from '../config.js';
import { CircuitBreaker } from './breaker.js';

const breaker = new CircuitBreaker(config.breakerFailureThreshold, config.breakerCooldownMs);

const symbolToId = {
  BTC: 'bitcoin',
  ETH: 'ethereum',
  SOL: 'solana'
};

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithTimeout(url, timeoutMs) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { signal: controller.signal, headers: { accept: 'application/json' } });
  } finally {
    clearTimeout(timeout);
  }
}

export async function fetchQuote(symbol) {
  const id = symbolToId[symbol];
  if (!id) throw new AppError(400, 'INVALID_SYMBOL', 'Unsupported symbol');

  if (!breaker.canExecute()) {
    throw new AppError(503, 'PROVIDER_UNAVAILABLE', 'Market provider temporarily unavailable');
  }

  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=usd&include_24hr_change=true`;

  let lastErr;
  for (let attempt = 0; attempt <= config.providerRetries; attempt += 1) {
    try {
      const res = await fetchWithTimeout(url, config.providerTimeoutMs);
      if (!res.ok) throw new AppError(502, 'UPSTREAM_FAILURE', `Provider returned ${res.status}`);
      const data = await res.json();
      const payload = data?.[id];
      if (!payload || typeof payload.usd !== 'number') {
        throw new AppError(502, 'UPSTREAM_MALFORMED', 'Provider payload missing fields');
      }
      breaker.recordSuccess();
      return {
        symbol,
        priceUsd: payload.usd,
        change24hPct: typeof payload.usd_24h_change === 'number' ? payload.usd_24h_change : 0,
        source: 'coingecko',
        asOf: new Date().toISOString()
      };
    } catch (err) {
      lastErr = err;
      breaker.recordFailure();
      if (attempt < config.providerRetries) await sleep((attempt + 1) * 250);
    }
  }

  if (lastErr instanceof AppError) throw lastErr;
  throw new AppError(502, 'UPSTREAM_FAILURE', 'Unable to retrieve quote');
}
