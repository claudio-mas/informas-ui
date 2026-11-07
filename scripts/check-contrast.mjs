// Uso (no repositório): npm run check:contrast [-- marca.css ...] [--json]
// Verifica os tokens base de tokens/*.json, com arquivos de marca opcionais por cima.
// Nos projetos, a verificação vem do item "contraste" do registro (scripts/informas-contrast.mjs).
import { checkContrast, formatReport } from './lib/contrast.mjs';

const args = process.argv.slice(2);
const files = args.filter(arg => !arg.startsWith('--'));
try {
  const report = checkContrast({ files });
  console.log(args.includes('--json') ? JSON.stringify(report, null, 2) : formatReport(report));
  process.exitCode = report.failures.length ? 1 : 0;
} catch (error) {
  console.error(`check-contrast: ${error.message}`);
  process.exitCode = 2;
}
