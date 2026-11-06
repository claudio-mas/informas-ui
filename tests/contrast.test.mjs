import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { contrastRatio, parseColor } from '../scripts/lib/color.mjs';
import { checkContrast } from '../scripts/lib/contrast.mjs';

const bin = fileURLToPath(new URL('../scripts/check-contrast.mjs', import.meta.url));
const example = fileURLToPath(new URL('../themes/exemplo-marca.css', import.meta.url));
const dir = mkdtempSync(join(tmpdir(), 'informas-contrast-'));
const css = (name, content) => { const file = join(dir, name); writeFileSync(file, content); return file; };

test('converte os formatos de cor aceitos', () => {
  assert.deepEqual(parseColor('#fff'), [1, 1, 1, 1]);
  assert.deepEqual(parseColor('rgb(255 0 0 / 50%)'), [1, 0, 0, 0.5]);
  assert.deepEqual(parseColor('rgba(0, 0, 255, 1)'), [0, 0, 1, 1]);
  assert.deepEqual(parseColor('hsl(0 0% 100%)').map(Math.round), [1, 1, 1, 1]);
  assert.deepEqual(parseColor('oklch(1 0 0)').map(c => Math.round(c * 100) / 100), [1, 1, 1, 1]);
  assert.equal(parseColor('221 83% 53%'), null, 'triplet HSL sem hsl() não é cor CSS');
  assert.equal(contrastRatio([0, 0, 0], [1, 1, 1]), 21);
});

test('os tokens base passam em todos os pares, nos dois temas', () => {
  const { failures, results } = checkContrast();
  assert.equal(failures.length, 0, JSON.stringify(failures, null, 2));
  assert.ok(results.some(r => r.mode === 'dark'));
});

test('o tema de exemplo passa em todos os pares', () => {
  const { failures, warnings } = checkContrast({ files: [example] });
  assert.deepEqual(failures, []);
  assert.deepEqual(warnings, []);
});

test('marca com contraste insuficiente falha e a CLI sai com código 1', () => {
  const file = css('ruim.css', ':root { --primary: #eeeeee; --primary-foreground: #ffffff; }');
  const { failures } = checkContrast({ files: [file] });
  assert.ok(failures.some(f => f.fg === 'primary-foreground' && f.bg === 'primary' && f.mode === 'light'));
  const run = spawnSync(process.execPath, [bin, file], { encoding: 'utf8' });
  assert.equal(run.status, 1);
  assert.match(run.stdout, /FALHA primary-foreground \/ primary/);
});

test(':root declarado depois do tema base também vale no escuro (cascata real)', () => {
  const file = css('so-root.css', ':root { --primary: #ffffff; --primary-foreground: #000000; }');
  const dark = checkContrast({ files: [file] }).results.find(r => r.mode === 'dark' && r.fg === 'primary-foreground' && r.bg === 'primary');
  assert.equal(dark.bgHex, '#ffffff');
});

test('.dark do arquivo de marca só afeta o tema escuro, inclusive dentro de @layer', () => {
  const file = css('layer.css', '@layer base { .dark { --primary: #000000; --primary-foreground: #ffffff; } }');
  const { results } = checkContrast({ files: [file] });
  const pick = mode => results.find(r => r.mode === mode && r.fg === 'primary-foreground' && r.bg === 'primary').bgHex;
  assert.equal(pick('dark'), '#000000');
  assert.notEqual(pick('light'), '#000000');
});

test('valor que não é cor é reportado como falha, com explicação', () => {
  const file = css('triplet.css', ':root { --primary: 221 83% 53%; }');
  const failure = checkContrast({ files: [file] }).failures.find(f => f.error);
  assert.match(failure.error, /não é uma cor suportada/);
});

test('seletor desconhecido gera aviso', () => {
  const file = css('aviso.css', '.minha-marca { --primary: #000; }');
  assert.match(checkContrast({ files: [file] }).warnings[0], /ignorado/);
});
