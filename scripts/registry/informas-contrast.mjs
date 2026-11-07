#!/usr/bin/env node
// informas-ui — verificação de contraste WCAG dos tokens semânticos.
// Uso: node scripts/informas-contrast.mjs [globals.css] [brand.css ...] [--json]
// Sem arquivos, lê o CSS indicado em components.json (tailwind.css).
// Os arquivos são aplicados na ordem dada, como na cascata do navegador.
import { existsSync, readFileSync } from 'node:fs';
import { checkCss, formatReport } from '../lib/contrast.mjs';
import CONTRASTE from '../../tokens/contrast.json' with { type: 'json' };

const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
  console.log('Uso: node scripts/informas-contrast.mjs [globals.css] [brand.css ...] [--json]');
  process.exit(0);
}
let files = args.filter(arg => !arg.startsWith('--'));
if (!files.length && existsSync('components.json')) {
  const css = JSON.parse(readFileSync('components.json', 'utf8'))?.tailwind?.css;
  if (css) files = [css];
}
if (!files.length) {
  console.error('informas-contrast: informe o arquivo CSS do tema (não encontrei components.json com tailwind.css).');
  process.exit(2);
}
try {
  const report = checkCss({ files, contrast: CONTRASTE });
  console.log(args.includes('--json') ? JSON.stringify(report, null, 2) : formatReport(report));
  process.exitCode = report.failures.length ? 1 : 0;
} catch (error) {
  console.error(`informas-contrast: ${error.message}`);
  process.exitCode = 2;
}
