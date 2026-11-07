import test from 'node:test';
import assert from 'node:assert/strict';
import { compile } from '@tailwindcss/node';
import { fileURLToPath } from 'node:url';
import { themeItem } from '../scripts/lib/registry.mjs';
import { cssInstalado } from './instalacao.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));

test('o tema instalado gera os utilitários semânticos no Tailwind v4, com marca e modo escuro por classe', async () => {
  const marca = ':root { --primary: oklch(0.48 0.09 185); }\n.dark { --primary: oklch(0.78 0.1 185); }\n';
  const compiler = await compile(cssInstalado(themeItem(undefined, 'teste'), marca), { base: root, onDependency() {} });
  const out = compiler.build(['bg-primary', 'text-primary-foreground', 'border-input', 'ring-ring', 'bg-success-subtle', 'text-destructive-subtle-foreground', 'rounded-lg', 'rounded-sm', 'font-sans', 'dark:bg-card', 'bg-sidebar']);
  assert.match(out, /\.bg-primary \{\s*background-color: var\(--primary\);/);
  assert.match(out, /\.border-input \{[\s\S]*?border-color: var\(--input\);/);
  assert.match(out, /\.bg-success-subtle \{\s*background-color: var\(--success-subtle\);/);
  assert.match(out, /\.rounded-lg \{\s*border-radius: var\(--radius\);/);
  assert.match(out, /\.rounded-sm \{\s*border-radius: calc\(var\(--radius\) - 4px\);/);
  assert.match(out, /\.font-sans \{\s*font-family: var\(--font-family-sans\);/);
  assert.match(out, /\.dark\\:bg-card:is\(\.dark \*\) \{\s*background-color: var\(--card\);/);
  assert.ok(out.lastIndexOf('--primary: oklch(0.48 0.09 185)') > out.indexOf('--primary: var(--informas-neutral-900)'), 'a marca precisa vir depois do tema');
});
