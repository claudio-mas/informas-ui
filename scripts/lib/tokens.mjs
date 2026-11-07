// Carrega os tokens de tokens/*.json e gera as declarações CSS.
import { readFileSync } from 'node:fs';

export const PREFIX = 'informas';
const tokensDir = new URL('../../tokens/', import.meta.url);
const read = name => JSON.parse(readFileSync(new URL(name, tokensDir), 'utf8'));
const withoutMeta = object => Object.fromEntries(Object.entries(object).filter(([key]) => !key.startsWith('$')));

export function loadTokens() {
  return {
    primitives: withoutMeta(read('primitives.json')),
    semantic: withoutMeta(read('semantic.json')),
    contrast: withoutMeta(read('contrast.json')),
  };
}

export const primitiveVar = (scale, step) => `--${PREFIX}-${scale}-${step}`;

/** Converte {escala.passo} e {token} em var(--…); outros valores passam inalterados. */
function toCss(value, { primitives, names, where }) {
  return value.replace(/\{([^}]+)\}/g, (_, ref) => {
    const [scale, step] = ref.split('.');
    if (step !== undefined) {
      if (primitives[scale]?.[step] === undefined) throw new Error(`${where}: primitiva inexistente {${ref}}`);
      return `var(${primitiveVar(scale, step)})`;
    }
    if (!names.has(ref)) throw new Error(`${where}: token semântico inexistente {${ref}}`);
    return `var(--${ref})`;
  });
}

/** Declarações em ordem de cascata: [{ selector, decls: [[nome, valor]] }]. */
export function cssBlocks(tokens = loadTokens()) {
  const { primitives, semantic } = tokens;
  const lightNames = Object.keys(semantic.light);
  const darkNames = Object.keys(semantic.dark);
  const missing = [...lightNames.filter(n => !darkNames.includes(n)).map(n => `dark.${n}`), ...darkNames.filter(n => !lightNames.includes(n)).map(n => `light.${n}`)];
  if (missing.length) throw new Error(`Tokens ausentes em um dos temas: ${missing.join(', ')}`);
  const names = new Set(lightNames);
  const prim = Object.entries(primitives).flatMap(([scale, steps]) => Object.entries(steps).map(([step, value]) => [primitiveVar(scale, step), value]));
  const shared = Object.entries(semantic.shared).map(([name, value]) => [`--${name}`, value]);
  const theme = mode => Object.entries(semantic[mode]).map(([name, value]) => [`--${name}`, toCss(value, { primitives, names, where: `${mode}.${name}` })]);
  return [
    { selector: ':root', decls: [['color-scheme', 'light'], ...prim, ...shared, ...theme('light')] },
    { selector: '.dark', decls: [['color-scheme', 'dark'], ...theme('dark')] },
  ];
}

export const semanticColorNames = (tokens = loadTokens()) => Object.keys(tokens.semantic.light);

/** Resolve var(--x) recursivamente num mapa de variáveis CSS. */
export function resolveVar(name, vars, seen = new Set()) {
  if (seen.has(name)) throw new Error(`Referência circular em ${[...seen, name].join(' → ')}`);
  const raw = vars.get(name);
  if (raw === undefined) return undefined;
  const next = new Set(seen).add(name);
  return raw.replace(/var\(\s*(--[\w-]+)\s*(?:,\s*([^)]*))?\)/g, (match, ref, fallback) => resolveVar(ref, vars, next) ?? fallback?.trim() ?? match);
}

export function themeVars(blocks, mode) {
  const vars = new Map();
  for (const { selector, decls } of blocks) {
    if (selector === ':root' || (mode === 'dark' && selector === '.dark')) for (const [name, value] of decls) vars.set(name, value);
  }
  return vars;
}
