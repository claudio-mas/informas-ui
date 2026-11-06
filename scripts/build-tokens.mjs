// Gera dist/tokens.css, dist/theme.css e dist/tokens.json a partir de tokens/*.json.
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { renderOutputs, semanticColorNames } from './lib/tokens.mjs';

const root = new URL('../', import.meta.url);
const { version } = JSON.parse(await readFile(new URL('package.json', root), 'utf8'));
const { tokensCss, themeCss, tokensJson } = renderOutputs(undefined, version);
await mkdir(new URL('dist/', root), { recursive: true });
await Promise.all([
  writeFile(new URL('dist/tokens.css', root), tokensCss),
  writeFile(new URL('dist/theme.css', root), themeCss),
  writeFile(new URL('dist/tokens.json', root), tokensJson),
]);
console.log(`informas-ui ${version}: ${semanticColorNames().length} tokens semânticos por tema → dist/tokens.css, dist/theme.css, dist/tokens.json`);
