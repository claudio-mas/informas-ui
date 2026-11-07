// Monta os itens do registro shadcn a partir de tokens/*.json.
import { readFileSync } from 'node:fs';
import { loadTokens, primitiveVar, semanticColorNames } from './tokens.mjs';

const registryDir = new URL('../../registry/', import.meta.url);

/**
 * Versões das dependências npm dos componentes, por faixa de major (sem ^ nem ~:
 * o CLI repassa o texto ao gerenciador de pacotes, e no cmd do Windows ^ é escape).
 */
export const NPM_VERSIONS = {
  'radix-ui': '1',
  cn: '0.5',
  'class-variance-authority': '0.7',
  'lucide-react': '1',
  sonner: '2',
  '@tanstack/react-table': '9',
};
const PEERS = new Set(['react', 'react-dom']);
const FILE_TYPES = { ui: 'registry:ui', hooks: 'registry:hook', lib: 'registry:lib', blocks: 'registry:component' };

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

const packageName = spec => (spec.startsWith('@') ? spec.split('/').slice(0, 2).join('/') : spec.split('/')[0]);

/** Lê o manifesto e monta os itens de componentes, derivando dependências dos imports. */
export function componentItems(version) {
  const { items } = JSON.parse(readFileSync(new URL('items.json', registryDir), 'utf8'));
  const owner = new Map(items.flatMap(item => item.files.map(file => [file.replace(/\.tsx?$/, ''), item.name])));
  return items.map(def => {
    const dependencies = new Set();
    const registryDependencies = new Set();
    const files = def.files.map(rel => {
      const content = readFileSync(new URL(`informas/${rel}`, registryDir), 'utf8');
      for (const [, spec] of content.matchAll(/(?:from|import)\s+["']([^"']+)["']/g)) {
        if (spec.startsWith('@/registry/informas/')) {
          const target = owner.get(spec.slice('@/registry/informas/'.length));
          if (!target) throw new Error(`${rel}: import ${spec} não pertence a nenhum item`);
          if (target !== def.name) registryDependencies.add(`@informas/${target}`);
        } else if (spec.startsWith('.') || spec.startsWith('@/')) {
          throw new Error(`${rel}: use @/registry/informas/… em vez de ${spec}`);
        } else if (!PEERS.has(packageName(spec))) {
          const pkg = packageName(spec);
          if (!NPM_VERSIONS[pkg]) throw new Error(`${rel}: dependência ${pkg} sem versão em NPM_VERSIONS`);
          dependencies.add(`${pkg}@${NPM_VERSIONS[pkg]}`);
        }
      }
      return { path: `registry/informas/${rel}`, type: FILE_TYPES[rel.split('/')[0]], content };
    });
    // Componentes dependem dos tokens: quem instalar um botão leva o tema junto.
    if (def.type === 'registry:ui' || def.type === 'registry:block') registryDependencies.add('@informas/tema');
    const item = { $schema: SCHEMA, name: def.name, type: def.type, title: def.title, description: def.description };
    if (dependencies.size) item.dependencies = [...dependencies].sort();
    if (registryDependencies.size) item.registryDependencies = [...registryDependencies].sort();
    item.files = files;
    if (def.docs) item.docs = def.docs;
    return item;
  });
}

/** CSS equivalente ao que o `shadcn add @informas/tema` escreve (para testes e catálogo). */
const cssBlock = (selector, vars) => `${selector} {\n${Object.entries(vars).map(([k, v]) => `  --${k}: ${v};`).join('\n')}\n}\n`;
const cssRules = (obj, indent = '') => Object.entries(obj).map(([sel, body]) => typeof body === 'string'
  ? `${indent}${sel}: ${body};`
  : `${indent}${sel} {\n${cssRules(body, indent + '  ')}\n${indent}}`).join('\n');
export function installedThemeCss(theme, extra = '') {
  return `@import "tailwindcss";\n\n@custom-variant dark (&:is(.dark *));\n\n${cssBlock('@theme inline', theme.cssVars.theme)}\n` +
    `${cssBlock(':root', theme.cssVars.light)}\n${cssBlock('.dark', theme.cssVars.dark)}\n${cssRules(theme.css)}\n${extra}`;
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
