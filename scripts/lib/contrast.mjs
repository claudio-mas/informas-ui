// Verifica os pares de contraste de tokens/contrast.json nos temas claro e escuro,
// opcionalmente com arquivos CSS de marca aplicados por cima (na ordem da cascata).
import { readFileSync } from 'node:fs';
import { composite, contrastRatio, parseColor, toHex } from './color.mjs';
import { cssBlocks, loadTokens, resolveVar, themeVars } from './tokens.mjs';

/**
 * Extrai blocos :root/html (tema claro e base) e .dark (tema escuro) de um CSS.
 * Blocos dentro de @media, @layer ou @supports são lidos como se estivessem fora.
 */
export function parseThemeCss(css, file = 'CSS') {
  const blocks = [];
  const warnings = [];
  const clean = css.replace(/\/\*[\s\S]*?\*\//g, '');
  for (const [, rawSelector, body] of clean.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const selector = rawSelector.trim();
    if (selector.startsWith('@')) continue; // @theme inline, @layer… não definem os tokens
    const decls = [...body.matchAll(/(--[\w-]+)\s*:\s*([^;]+?)\s*(?:;|$)/g)].map(([, name, value]) => [name, value.replace(/\s*!important$/, '')]);
    if (!decls.length) continue;
    const parts = selector.split(',').map(s => s.trim());
    const isDark = parts.some(s => /\.dark\b/.test(s));
    const isRoot = parts.some(s => s === ':root' || s === 'html' || s === ':host');
    if (isDark) blocks.push({ selector: '.dark', decls });
    else if (isRoot) blocks.push({ selector: ':root', decls });
    else warnings.push(`${file}: seletor "${selector}" ignorado (use :root para o tema claro e .dark para o escuro).`);
  }
  return { blocks, warnings };
}

function background(vars, mode) {
  const color = parseColor(resolveVar('--background', vars) ?? '');
  const fallback = mode === 'dark' ? [0, 0, 0, 1] : [1, 1, 1, 1];
  return color ? composite(color, fallback) : fallback;
}

/** Verifica os pares sobre uma sequência de blocos já na ordem da cascata. */
export function evaluate(blocks, { minimums, pairs }) {
  const results = [];
  for (const mode of ['light', 'dark']) {
    const vars = themeVars(blocks, mode);
    const page = background(vars, mode);
    for (const [kind, fgName, bgName] of pairs) {
      const min = minimums[kind];
      const fgValue = resolveVar(`--${fgName}`, vars);
      const bgValue = resolveVar(`--${bgName}`, vars);
      const fg = parseColor(fgValue ?? '');
      const bgRaw = parseColor(bgValue ?? '');
      const base = { mode, kind, fg: fgName, bg: bgName, min };
      if (!fg || !bgRaw) {
        const bad = !fg ? [fgName, fgValue] : [bgName, bgValue];
        results.push({ ...base, ok: false, error: `--${bad[0]}: valor "${bad[1] ?? 'não definido'}" não é uma cor suportada (hex, rgb, hsl, oklch).` });
        continue;
      }
      const bg = composite(bgRaw, page);
      const ratio = contrastRatio(composite(fg, bg), bg);
      results.push({ ...base, ratio, ok: ratio >= min, fgHex: toHex(fg), bgHex: toHex(bgRaw) });
    }
  }
  return results;
}

function readFiles(files) {
  const blocks = [];
  const warnings = [];
  for (const file of files) {
    const parsed = parseThemeCss(readFileSync(file, 'utf8'), file);
    blocks.push(...parsed.blocks);
    warnings.push(...parsed.warnings);
  }
  return { blocks, warnings };
}

/** Só os arquivos CSS do projeto (o tema já foi copiado para eles pelo registro). */
export function checkCss({ files, contrast }) {
  const { blocks, warnings } = readFiles(files);
  const results = evaluate(blocks, contrast);
  return { results, warnings, failures: results.filter(r => !r.ok) };
}

/** Tokens base do repositório, com arquivos de marca opcionais por cima. */
export function checkContrast({ files = [], tokens = loadTokens() } = {}) {
  const extra = readFiles(files);
  const results = evaluate([...cssBlocks(tokens), ...extra.blocks], tokens.contrast);
  return { results, warnings: extra.warnings, failures: results.filter(r => !r.ok) };
}

export function formatReport({ results, warnings, failures }) {
  const lines = [];
  for (const mode of ['light', 'dark']) {
    lines.push(`\n${mode === 'light' ? 'Tema claro' : 'Tema escuro'}`);
    for (const r of results.filter(item => item.mode === mode)) {
      const status = r.ok ? 'ok   ' : 'FALHA';
      const detail = r.error ?? `${r.ratio.toFixed(2)}:1 (mín. ${r.min}:1)  ${r.fgHex} sobre ${r.bgHex}`;
      lines.push(`  ${status} ${`${r.fg} / ${r.bg}`.padEnd(54)} ${detail}`);
    }
  }
  for (const warning of warnings) lines.push(`aviso: ${warning}`);
  lines.push('', failures.length ? `${failures.length} par(es) abaixo do mínimo.` : `Todos os ${results.length} pares atendem ao mínimo.`);
  return lines.join('\n');
}
