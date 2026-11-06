#!/usr/bin/env node
// Uso: informas-contrast [marca.css ...] [--json]
// Sem arquivos, verifica os tokens base. Com arquivos, aplica-os por cima na ordem dada,
// como o navegador faria se fossem importados depois do tema.
import { checkContrast, formatReport } from './lib/contrast.mjs';

const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
  console.log('Uso: informas-contrast [marca.css ...] [--json]\nVerifica o contraste WCAG dos tokens semânticos nos temas claro e escuro.');
  process.exit(0);
}
const files = args.filter(arg => !arg.startsWith('--'));
try {
  const report = checkContrast({ files });
  console.log(args.includes('--json') ? JSON.stringify(report, null, 2) : formatReport(report));
  process.exitCode = report.failures.length ? 1 : 0;
} catch (error) {
  console.error(`informas-contrast: ${error.message}`);
  process.exitCode = 2;
}
