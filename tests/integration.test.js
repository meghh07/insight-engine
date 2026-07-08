import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { createAppServer } from '../backend/src/server.js';

test('health endpoints return success', async (t) => {
  const server = createAppServer();
  server.listen(0);
  await once(server, 'listening');
  const { port } = server.address();

  await t.test('liveness', async () => {
    const res = await fetch(`http://127.0.0.1:${port}/health/live`);
    assert.equal(res.status, 200);
  });

  await t.test('readiness', async () => {
    const res = await fetch(`http://127.0.0.1:${port}/health/ready`);
    assert.equal(res.status, 200);
  });

  server.close();
});
