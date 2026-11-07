import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { loadTokens, primitiveVar, semanticColorNames } from '../scripts/lib/tokens.mjs';
import { cssInstalado } from './instalacao.mjs';

const dist = new URL('../dist/r/', import.meta.url);
const ler = nome => JSON.parse(readFileSync(new URL(nome, dist), 'utf8'));
const tema = ler('tema.json');
const contraste = ler('contraste.json');
const dir = mkdtempSync(join(tmpdir(), 'informas-registro-'));

test('o índice lista os itens com o esquema do shadcn', () => {
  const indice = ler('registry.json');
  assert.equal(indice.$schema, 'https://ui.shadcn.com/schema/registry.json');
  assert.equal(indice.name, 'informas');
  const manifesto = JSON.parse(readFileSync(new URL('../registry/items.json', import.meta.url), 'utf8')).items.map(i => i.name);
  assert.deepEqual(indice.items.map(i => i.name), ['tema', 'contraste', ...manifesto]);
  assert.equal(indice.version, JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8')).version);
  for (const item of [tema, contraste]) assert.equal(item.$schema, 'https://ui.shadcn.com/schema/registry-item.json');
});

test('o tema leva as primitivas, todos os semânticos nos dois modos e o mapeamento explícito para o Tailwind', () => {
  const { primitives } = loadTokens();
  for (const [escala, passos] of Object.entries(primitives)) {
    for (const passo of Object.keys(passos)) assert.ok(primitiveVar(escala, passo).slice(2) in tema.cssVars.light, `${escala}-${passo}`);
  }
  for (const nome of semanticColorNames()) {
    assert.ok(nome in tema.cssVars.light && nome in tema.cssVars.dark, nome);
    assert.equal(tema.cssVars.theme[`color-${nome}`], `var(--${nome})`);
  }
  assert.equal(tema.cssVars.light.primary, 'var(--informas-neutral-900)', 'semânticos apontam para as primitivas');
  for (const r of ['sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl']) assert.ok(`radius-${r}` in tema.cssVars.theme, `radius-${r} (senão o CLI completa com a escala dele)`);
  assert.ok(!JSON.stringify(tema.css).includes('custom-variant'), 'o CLI já acrescenta a variante dark');
});

test('o script de contraste vai para a raiz do projeto, sem dependências', () => {
  const [arquivo] = contraste.files;
  assert.equal(arquivo.target, '~/scripts/informas-contrast.mjs');
  assert.equal(arquivo.type, 'registry:file');
  assert.match(arquivo.content, /^#!\/usr\/bin\/env node\n/);
  assert.doesNotMatch(arquivo.content, /^\s*import .* from ['"](?!node:)/m, 'só módulos node: são permitidos');
});

test('o script verifica o CSS instalado, com e sem marca, e lê o components.json', () => {
  const script = join(dir, 'informas-contrast.mjs');
  writeFileSync(script, contraste.files[0].content);
  const css = join(dir, 'globals.css');
  writeFileSync(css, cssInstalado(tema));
  const ok = spawnSync(process.execPath, [script, css], { encoding: 'utf8' });
  assert.equal(ok.status, 0, ok.stdout + ok.stderr);
  assert.match(ok.stdout, /Todos os 78 pares atendem ao mínimo/);
  assert.doesNotMatch(ok.stdout, /aviso:/, '@theme inline e @layer base não geram avisos');

  const ruim = join(dir, 'ruim.css');
  writeFileSync(ruim, cssInstalado(tema, ':root { --primary: #eeeeee; }\n'));
  const falha = spawnSync(process.execPath, [script, ruim], { encoding: 'utf8' });
  assert.equal(falha.status, 1);
  assert.match(falha.stdout, /FALHA primary-foreground \/ primary/);

  writeFileSync(join(dir, 'components.json'), JSON.stringify({ tailwind: { css: 'globals.css' } }));
  const semArgs = spawnSync(process.execPath, [script], { cwd: dir, encoding: 'utf8' });
  assert.equal(semArgs.status, 0, semArgs.stdout + semArgs.stderr);
});

test('componentes: dependências derivadas dos imports, todos levam o tema e nada sobra do shadcn original', () => {
  const indice = ler('registry.json');
  const nomes = new Set(indice.items.map(i => i.name));
  for (const { name } of indice.items.filter(i => !['tema', 'contraste'].includes(i.name))) {
    const item = ler(`${name}.json`);
    for (const dep of item.registryDependencies ?? []) assert.ok(nomes.has(dep.replace('@informas/', '')), `${name}: ${dep} existe no registro`);
    if (['registry:ui', 'registry:block'].includes(item.type)) assert.ok(item.registryDependencies.includes('@informas/tema'), `${name} depende do tema`);
    for (const dep of item.dependencies ?? []) assert.match(dep, /^(@[\w-]+\/)?[\w.-]+@[\d.]+$/, `${name}: ${dep} com faixa sem ^ (cmd do Windows)`);
    for (const arquivo of item.files) {
      assert.doesNotMatch(arquivo.content, /new-york-v4|from "next-themes"/, `${name}: resto do shadcn original`);
      assert.doesNotMatch(arquivo.content, /ring-ring\/50|text-white|dark:bg-input\//, `${name}: classe sem ajuste aos tokens`);
    }
  }
  const sidebar = ler('sidebar.json');
  assert.equal(sidebar.cssVars, undefined, 'a sidebar não traz cssVars próprios (os tokens vêm do tema)');
  assert.ok(ler('data-table.json').dependencies.includes('@tanstack/react-table@9'));
});
