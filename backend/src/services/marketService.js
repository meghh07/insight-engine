import { fetchQuote } from './providerClient.js';

const cache = new Map();

export async function getMarketQuote(symbol) {
  try {
    const quote = await fetchQuote(symbol);
    cache.set(symbol, quote);
    return { ...quote, stale: false };
  } catch (err) {
    const fallback = cache.get(symbol);
    if (fallback) return { ...fallback, stale: true };
    throw err;
  }
}
