// Gera o registro shadcn em dist/r/: registry.json, tema.json e contraste.json.
import { build } from 'esbuild';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { componentItems, contrastItem, registryIndex, themeItem } from './lib/registry.mjs';

const root = new URL('../', import.meta.url);
const { version } = JSON.parse(await readFile(new URL('package.json', root), 'utf8'));

// O script de contraste vai para o projeto como um arquivo único, sem dependências.
const bundle = await build({
  entryPoints: [fileURLToPath(new URL('registry/informas-contrast.mjs', import.meta.url))],
  bundle: true, write: false, platform: 'node', format: 'esm', target: 'node20',
  legalComments: 'none',
  banner: { js: `#!/usr/bin/env node\n// Gerado pelo informas-ui ${version} (item "contraste" do registro). Para atualizar: npx shadcn@latest add @informas/contraste` },
});
const script = bundle.outputFiles[0].text.replace(/^#!.*\n(?=#!)/, '');

const items = [themeItem(undefined, version), contrastItem(script, version), ...componentItems(version)];
const out = new URL('dist/r/', root);
await mkdir(out, { recursive: true });
await Promise.all([
  ...items.map(item => writeFile(new URL(`${item.name}.json`, out), `${JSON.stringify(item, null, 2)}\n`)),
  writeFile(new URL('registry.json', out), `${JSON.stringify(registryIndex(items, version), null, 2)}\n`),
]);
console.log(`informas-ui ${version}: ${items.length} itens em dist/r/ + registry.json`);
