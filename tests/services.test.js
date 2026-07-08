import test from 'node:test';
import assert from 'node:assert/strict';
import { CircuitBreaker } from '../backend/src/services/breaker.js';
import { htmlEscape } from '../backend/src/utils/sanitize.js';

test('circuit breaker opens after threshold', () => {
  const b = new CircuitBreaker(2, 60_000);
  assert.equal(b.canExecute(), true);
  b.recordFailure();
  b.recordFailure();
  assert.equal(b.canExecute(), false);
});

test('html escape encodes risky input', () => {
  assert.equal(htmlEscape('<script>alert(1)</script>'), '&lt;script&gt;alert(1)&lt;/script&gt;');
});
