import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, copyFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { compile } from '@tailwindcss/node';
import { renderOutputs } from '../scripts/lib/tokens.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));

test('Tailwind v4 gera utilitários a partir do tema, com marca e modo escuro por classe', async t => {
  // Dentro de node_modules para o Tailwind resolver "tailwindcss" a partir do diretório.
  const dir = mkdtempSync(join(root, 'node_modules', '.informas-tw-'));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  writeFileSync(join(dir, 'theme.css'), renderOutputs().themeCss);
  copyFileSync(join(root, 'themes/exemplo-marca.css'), join(dir, 'brand.css'));
  const input = '@import "tailwindcss";\n@import "./theme.css";\n@import "./brand.css";\n';
  const compiler = await compile(input, { base: dir, onDependency() {} });
  const out = compiler.build(['bg-primary', 'text-primary-foreground', 'border-input', 'ring-ring', 'bg-success-subtle', 'text-destructive-subtle-foreground', 'rounded-lg', 'font-sans', 'dark:bg-card', 'bg-sidebar']);
  assert.match(out, /\.bg-primary \{\s*background-color: var\(--primary\);/);
  assert.match(out, /\.border-input \{[\s\S]*?border-color: var\(--input\);/);
  assert.match(out, /\.bg-success-subtle \{\s*background-color: var\(--success-subtle\);/);
  assert.match(out, /\.rounded-lg \{\s*border-radius: var\(--radius\);/);
  assert.match(out, /\.font-sans \{\s*font-family: var\(--font-family-sans\);/);
  assert.match(out, /\.dark\\:bg-card:where\(\.dark, \.dark \*\) \{\s*background-color: var\(--card\);/);
  assert.match(out, /--primary: oklch\(0\.48 0\.09 185\);/, 'a marca precisa entrar depois do tema');
});
