// Monta os itens do registro shadcn a partir de tokens/*.json.
import { loadTokens, primitiveVar, semanticColorNames } from './tokens.mjs';

const SCHEMA = 'https://ui.shadcn.com/schema/registry-item.json';
const strip = name => name.replace(/^--/, '');

/** {escala.passo} → var(--informas-escala-passo); {token} → var(--token). */
function refToCss(value) {
  return value.replace(/\{([^}]+)\}/g, (_, ref) => {
    const [scale, step] = ref.split('.');
    return step === undefined ? `var(--${ref})` : `var(${primitiveVar(scale, step)})`;
  });
}

/**
 * Item "tema". O CLI do shadcn escreve `light` em :root, `dark` em .dark e `theme` em @theme inline.
 * O mapeamento para utilitários (--color-*) vai explícito: o CLI só o deduz para cores literais,
 * e os tokens semânticos apontam para as primitivas.
 */
export function themeItem(tokens = loadTokens(), version) {
  const { primitives, semantic } = tokens;
  const light = {};
  for (const [scale, steps] of Object.entries(primitives)) for (const [step, value] of Object.entries(steps)) light[strip(primitiveVar(scale, step))] = value;
  for (const [name, value] of Object.entries(semantic.shared)) light[name] = value;
  for (const [name, value] of Object.entries(semantic.light)) light[name] = refToCss(value);
  const dark = Object.fromEntries(Object.entries(semantic.dark).map(([name, value]) => [name, refToCss(value)]));
  const theme = Object.fromEntries(semanticColorNames(tokens).map(name => [`color-${name}`, `var(--${name})`]));
  Object.assign(theme, {
    'radius-sm': 'calc(var(--radius) - 4px)',
    'radius-md': 'calc(var(--radius) - 2px)',
    'radius-lg': 'var(--radius)',
    'radius-xl': 'calc(var(--radius) + 4px)',
    'radius-2xl': 'calc(var(--radius) + 8px)',
    'radius-3xl': 'calc(var(--radius) + 12px)',
    'radius-4xl': 'calc(var(--radius) + 16px)',
    'font-sans': 'var(--font-family-sans)',
    'font-mono': 'var(--font-family-mono)',
  });
  return {
    $schema: SCHEMA,
    name: 'tema',
    type: 'registry:theme',
    title: 'Tema informas-ui',
    description: `Tokens neutros do informas-ui ${version}: escalas primitivas --informas-*, tokens semânticos com os nomes do shadcn/ui e estados info, success, warning e destructive. Tema escuro pela classe .dark.`,
    cssVars: { theme, light, dark },
    css: {
      '@layer base': {
        '*': { 'border-color': 'var(--color-border)', 'outline-color': 'var(--color-ring)' },
        body: { 'background-color': 'var(--color-background)', color: 'var(--color-foreground)', 'font-family': 'var(--font-sans)' },
      },
    },
  };
}

/** Item "contraste": um script sem dependências que verifica o CSS do próprio projeto. */
export function contrastItem(scriptContent, version) {
  return {
    $schema: SCHEMA,
    name: 'contraste',
    type: 'registry:item',
    title: 'Verificação de contraste',
    description: `Script do informas-ui ${version} que verifica o contraste WCAG dos tokens semânticos no CSS do projeto, nos temas claro e escuro. Uso: node scripts/informas-contrast.mjs [arquivo.css ...]`,
    files: [{ path: 'scripts/informas-contrast.mjs', type: 'registry:file', target: '~/scripts/informas-contrast.mjs', content: scriptContent }],
  };
}

export function registryIndex(items, version) {
  return {
    $schema: 'https://ui.shadcn.com/schema/registry.json',
    name: 'informas',
    homepage: 'https://github.com/claudio-mas/informas-ui',
    items: items.map(({ $schema, cssVars, css, files, ...meta }) => ({ ...meta, files: (files ?? []).map(({ content, ...f }) => f) })),
    version,
  };
}
