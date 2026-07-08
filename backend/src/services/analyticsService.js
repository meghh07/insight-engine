const events = [];

export function trackEvent(event, requestId) {
  events.push({ ...event, requestId, at: new Date().toISOString() });
  if (events.length > 1000) events.shift();
}

export function getSummary() {
  const byType = events.reduce((acc, event) => {
    acc[event.type] = (acc[event.type] ?? 0) + 1;
    return acc;
  }, {});

  return {
    totalEvents: events.length,
    byType,
    lastEventAt: events.length ? events[events.length - 1].at : null
  };
}
