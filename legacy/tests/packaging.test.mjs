import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile, copyFile, cp } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
const root = fileURLToPath(new URL('../', import.meta.url));
const repoRoot = fileURLToPath(new URL('../../', import.meta.url));

test('standalone generator works from a directory containing spaces and accents', async () => {
  const fixture = resolve(root, '.test-work/Kit com espaços');
  await mkdir(join(fixture, 'scripts'), { recursive:true });
  await mkdir(join(fixture, 'demo'), { recursive:true });
  await writeFile(join(fixture, 'package.json'), '{"type":"module"}');
  await copyFile(join(root, 'scripts/build-standalone.mjs'), join(fixture, 'scripts/build-standalone.mjs'));
  await writeFile(join(fixture, 'demo/main.tsx'), 'document.body.dataset.fixture = "standalone-fixture-ok";');
  for (const css of ['tokens.css','components.css','demo/catalog.css']) await writeFile(join(fixture, css), '/* fixture styles */');
  await mkdir(join(fixture, 'node_modules'), { recursive:true });
  await cp(join(repoRoot,'node_modules/esbuild'),join(fixture,'node_modules/esbuild'),{recursive:true});
  await cp(join(repoRoot,'node_modules/@esbuild'),join(fixture,'node_modules/@esbuild'),{recursive:true});
  const result = spawnSync(process.execPath, [join(fixture, 'scripts/build-standalone.mjs')], { cwd:fixture, encoding:'utf8' });
  assert.equal(result.status, 0, result.stderr);
  const html = await readFile(join(fixture, 'DEMO.html'), 'utf8');
  assert.match(html, /standalone-fixture-ok/);
  assert.doesNotMatch(html, /<script[^>]+src=/);
});

test('published declarations are accepted by TypeScript NodeNext consumers', () => {
  const result = spawnSync(process.execPath, [join(repoRoot,'node_modules/typescript/bin/tsc'), '--ignoreConfig', '--noEmit', '--module', 'NodeNext', '--moduleResolution', 'NodeNext', '--target', 'ES2022', '--skipLibCheck', 'false', 'dist/index.d.ts'], { cwd:root, encoding:'utf8' });
  assert.equal(result.status, 0, result.stdout + result.stderr);
});
