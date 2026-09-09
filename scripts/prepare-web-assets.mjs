import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const project = path.resolve(root, '..');
const output = path.join(project, 'www');
const excluded = new Set(['.git', '.npm-cache', 'android', 'node_modules', 'tests', 'www']);

fs.rmSync(output, { recursive: true, force: true });
fs.mkdirSync(output, { recursive: true });
fs.writeFileSync(path.join(output, '.gitkeep'), '');

for (const entry of fs.readdirSync(project, { withFileTypes: true })) {
  if (excluded.has(entry.name)) continue;
  const source = path.join(project, entry.name);
  const target = path.join(output, entry.name);
  fs.cpSync(source, target, { recursive: true });
}

console.log('Prepared Capacitor web assets in www/.');
