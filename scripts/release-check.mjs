import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';

function run(label, command, args, cwd = root) {
  console.log(`\n[release-check] ${label}`);
  const result = spawnSync(command, args, {
    cwd,
    stdio: 'inherit',
    // Windows command shims (*.cmd/*.bat) require a shell to launch reliably.
    shell: process.platform === 'win32',
  });

  if (result.error) {
    console.error(`[release-check] ${label} could not start: ${result.error.message}`);
    process.exit(1);
  }
  if (result.status !== 0) {
    console.error(`[release-check] ${label} failed with exit code ${result.status ?? 'unknown'}.`);
    process.exit(result.status || 1);
  }
}

run('Run the complete test suite', npmCommand, ['run', 'test']);
run('Prepare and synchronize Capacitor assets', npmCommand, ['run', 'cap:sync']);

const gradleCommand = process.platform === 'win32' ? 'gradlew.bat' : './gradlew';
const gradlePath = join(root, 'android', gradleCommand);
if (!existsSync(gradlePath)) {
  console.error(`[release-check] Android Gradle wrapper not found: ${gradlePath}`);
  process.exit(1);
}

run('Verify Android debug build', gradleCommand, ['assembleDebug', '--stacktrace'], join(root, 'android'));
console.log('\n[release-check] All release checks passed.');
