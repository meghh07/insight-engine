import { readdir, stat, readFile } from 'node:fs/promises';
import { join } from 'node:path';

const roots = ['backend/src', 'frontend', 'tests', 'scripts', 'shared'];
const forbiddenPatterns = [/API_KEY\s*=\s*['\"][^'\"]+['\"]/i, /newsapi\.org/i];

async function* walk(dir) {
  for (const entry of await readdir(dir)) {
    const full = join(dir, entry);
    const st = await stat(full);
    if (st.isDirectory()) {
      yield* walk(full);
    } else {
      yield full;
    }
  }
}

let failures = 0;
for (const root of roots) {
  for await (const file of walk(root)) {
    if (!file.endsWith('.js') && !file.endsWith('.html') && !file.endsWith('.css')) continue;
    const content = await readFile(file, 'utf8');
    for (const pattern of forbiddenPatterns) {
      if (pattern.test(content)) {
        console.error(`Forbidden pattern ${pattern} found in ${file}`);
        failures += 1;
      }
    }
  }
}

if (failures > 0) {
  process.exitCode = 1;
} else {
  console.log('Lint checks passed');
}
