import { mkdir, cp, writeFile, rm } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const projectRoot = process.cwd();
const distDir = join(projectRoot, 'dist');

await rm(distDir, { recursive: true, force: true });
await mkdir(distDir, { recursive: true });
await cp(join(projectRoot, 'frontend'), distDir, { recursive: true });

const files = ['index.html', 'style.css', 'app.js'];
const manifest = {};
for (const file of files) {
  const full = join(distDir, file);
  const hash = createHash('sha256').update(readFileSync(full)).digest('hex');
  manifest[file] = hash;
}

await writeFile(join(distDir, 'manifest.json'), JSON.stringify(manifest, null, 2));
console.log('Build completed:', manifest);
