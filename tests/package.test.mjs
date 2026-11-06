import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));

test('o pacote publica só a base nova, sem a v1 (legacy/)', () => {
  const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  const run = spawnSync(npm, ['pack', '--dry-run', '--json', '--ignore-scripts'], { cwd: root, encoding: 'utf8', shell: process.platform === 'win32' });
  assert.equal(run.status, 0, run.stderr);
  const files = JSON.parse(run.stdout)[0].files.map(f => f.path).sort();
  for (const expected of ['dist/theme.css', 'dist/tokens.css', 'dist/tokens.json', 'themes/exemplo-marca.css', 'scripts/check-contrast.mjs', 'scripts/lib/contrast.mjs', 'tokens/semantic.json', 'package.json', 'README.md', 'LICENSE', 'CHANGELOG.md']) {
    assert.ok(files.includes(expected), `falta ${expected} no pacote`);
  }
  assert.deepEqual(files.filter(f => /^(legacy|site|tests|node_modules)\//.test(f)), []);
});
