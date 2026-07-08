const settingsByUser = new Map();

export function getSettings(userId) {
  if (!settingsByUser.has(userId)) {
    settingsByUser.set(userId, { theme: 'dark', notificationsEnabled: true });
  }
  return settingsByUser.get(userId);
}

export function updateSettings(userId, value) {
  const current = getSettings(userId);
  const next = {
    ...current,
    theme: value.theme,
    notificationsEnabled: value.notificationsEnabled
  };
  settingsByUser.set(userId, next);
  return next;
}
