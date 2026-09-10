import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const project = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const metadata = JSON.parse(fs.readFileSync(path.join(project, 'app-metadata.json'), 'utf8'));
const packageJson = JSON.parse(fs.readFileSync(path.join(project, 'package.json'), 'utf8'));

const required = ['name', 'shortName', 'packageId', 'version', 'versionCode', 'description'];
for (const key of required) {
  if (metadata[key] === undefined || metadata[key] === '') throw new Error(`Missing app metadata: ${key}`);
}
if (!/^\d+\.\d+\.\d+$/.test(metadata.version)) throw new Error('App version must use major.minor.patch format.');
if (!Number.isInteger(metadata.versionCode) || metadata.versionCode < 1) throw new Error('versionCode must be a positive integer.');
if (packageJson.version !== metadata.version) {
  throw new Error(`package.json version (${packageJson.version}) does not match app-metadata.json (${metadata.version}).`);
}
console.log(`App metadata valid: ${metadata.shortName} ${metadata.version} (${metadata.packageId})`);
