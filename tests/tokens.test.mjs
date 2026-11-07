import test from 'node:test';
import assert from 'node:assert/strict';
import { parseColor } from '../scripts/lib/color.mjs';
import { cssBlocks, loadTokens, resolveVar, semanticColorNames, themeVars } from '../scripts/lib/tokens.mjs';

const SHADCN = ['background', 'foreground', 'card', 'card-foreground', 'popover', 'popover-foreground', 'primary', 'primary-foreground', 'secondary', 'secondary-foreground', 'muted', 'muted-foreground', 'accent', 'accent-foreground', 'destructive', 'border', 'input', 'ring', 'chart-1', 'chart-2', 'chart-3', 'chart-4', 'chart-5', 'sidebar', 'sidebar-foreground', 'sidebar-primary', 'sidebar-primary-foreground', 'sidebar-accent', 'sidebar-accent-foreground', 'sidebar-border', 'sidebar-ring'];

test('inclui todos os tokens que os componentes do shadcn/ui esperam', () => {
  const names = semanticColorNames();
  for (const name of SHADCN) assert.ok(names.includes(name), `falta --${name}`);
});

test('cada estado tem preenchimento, texto sobre ele, fundo suave e texto sobre o fundo suave', () => {
  const names = semanticColorNames();
  for (const state of ['info', 'success', 'warning', 'destructive']) {
    for (const suffix of ['', '-foreground', '-subtle', '-subtle-foreground']) assert.ok(names.includes(state + suffix), `falta --${state}${suffix}`);
  }
});

test('todo token semântico resolve para uma cor válida nos dois temas', () => {
  const blocks = cssBlocks();
  for (const mode of ['light', 'dark']) {
    const vars = themeVars(blocks, mode);
    for (const name of semanticColorNames()) {
      const value = resolveVar(`--${name}`, vars);
      assert.ok(parseColor(value), `${mode}: --${name} = ${value}`);
    }
  }
});

test('referência inexistente interrompe o build', () => {
  const tokens = loadTokens();
  const broken = structuredClone(tokens);
  broken.semantic.light.primary = '{neutral.999}';
  assert.throws(() => cssBlocks(broken), /primitiva inexistente \{neutral\.999\}/);
  broken.semantic.light.primary = '{nao-existe}';
  assert.throws(() => cssBlocks(broken), /token semântico inexistente/);
});

test('tema claro e escuro precisam ter os mesmos tokens', () => {
  const broken = structuredClone(loadTokens());
  delete broken.semantic.dark.muted;
  assert.throws(() => cssBlocks(broken), /dark\.muted/);
});
