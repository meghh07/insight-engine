import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('frontend assets use relative paths for project Pages URLs', async () => {
  const html = await readFile(new URL('../frontend/index.html', import.meta.url), 'utf8');
  assert.match(html, /href="\.\/style\.css"/);
  assert.match(html, /src="\.\/app\.js"/);
});
