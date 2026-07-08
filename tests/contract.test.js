import test from 'node:test';
import assert from 'node:assert/strict';
import { schemas } from '../shared/contracts.js';
import { assertSchema } from '../backend/src/utils/validate.js';

test('login request contract validates', () => {
  assert.doesNotThrow(() => assertSchema(schemas.loginRequest, { username: 'admin', password: 'x' }));
});

test('alert request rejects invalid payload', () => {
  assert.throws(() => assertSchema(schemas.alertRequest, { symbol: 'BTC', targetPrice: '123' }));
});
