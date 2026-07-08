export function deriveSignal(quote) {
  const direction = quote.change24hPct >= 0 ? 'bullish' : 'bearish';
  const confidence = Math.min(95, Math.max(55, Math.round(Math.abs(quote.change24hPct) * 3 + 55)));

  return {
    symbol: quote.symbol,
    direction,
    confidence,
    rationale:
      direction === 'bullish'
        ? 'Positive 24h trend and momentum support upside bias.'
        : 'Negative 24h trend indicates downside risk remains elevated.',
    asOf: quote.asOf
  };
}
