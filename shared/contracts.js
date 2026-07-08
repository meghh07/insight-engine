export const schemas = {
  loginRequest: {
    type: 'object',
    required: ['username', 'password'],
    properties: {
      username: { type: 'string' },
      password: { type: 'string' }
    }
  },
  alertRequest: {
    type: 'object',
    required: ['symbol', 'targetPrice'],
    properties: {
      symbol: { type: 'string' },
      targetPrice: { type: 'number' }
    }
  },
  settingsRequest: {
    type: 'object',
    required: ['theme', 'notificationsEnabled'],
    properties: {
      theme: { type: 'string' },
      notificationsEnabled: { type: 'boolean' }
    }
  },
  analyticsEvent: {
    type: 'object',
    required: ['type', 'payload'],
    properties: {
      type: { type: 'string' },
      payload: { type: 'object', properties: {} }
    }
  }
};
