import { randomUUID } from 'node:crypto';

const alertsByUser = new Map();

export function listAlerts(userId) {
  return alertsByUser.get(userId) ?? [];
}

export function createAlert(userId, input) {
  const existing = alertsByUser.get(userId) ?? [];
  const alert = {
    id: randomUUID(),
    symbol: input.symbol.toUpperCase(),
    targetPrice: input.targetPrice,
    createdAt: new Date().toISOString()
  };
  existing.push(alert);
  alertsByUser.set(userId, existing);
  return alert;
}

export function removeAlert(userId, alertId) {
  const existing = alertsByUser.get(userId) ?? [];
  const next = existing.filter((item) => item.id !== alertId);
  alertsByUser.set(userId, next);
  return next.length !== existing.length;
}
