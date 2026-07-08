export function log(level, message, context = {}) {
  const entry = {
    ts: new Date().toISOString(),
    level,
    message,
    ...context
  };
  // eslint-disable-next-line no-console
  console.log(JSON.stringify(entry));
}
