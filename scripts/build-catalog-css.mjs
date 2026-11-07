// Gera catalog/globals.gerado.css: o mesmo CSS que o `shadcn add @informas/tema` escreve num projeto.
import { writeFile } from 'node:fs/promises';
import { installedThemeCss, themeItem } from './lib/registry.mjs';

const css = installedThemeCss(themeItem(undefined, 'catálogo'), '\n@source "../registry";\n@source "./";\n');
await writeFile(new URL('../catalog/globals.gerado.css', import.meta.url), `/* Gerado por scripts/build-catalog-css.mjs. Não edite. */\n${css}`);
console.log('catalog/globals.gerado.css gerado');
