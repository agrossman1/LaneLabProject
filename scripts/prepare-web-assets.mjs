import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const project = path.resolve(root, '..');
const output = path.join(project, 'www');
const metadata = JSON.parse(fs.readFileSync(path.join(project, 'app-metadata.json'), 'utf8'));
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

// Keep the installable web metadata aligned with the native app metadata.
const manifestPath = path.join(output, 'manifest.webmanifest');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
manifest.name = metadata.name;
manifest.short_name = metadata.shortName;
manifest.description = metadata.description;
fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

console.log('Prepared Capacitor web assets in www/.');
