// Monta o CSS que o `shadcn add @informas/tema` escreve, para testar sem rede.
// O teste shadcn.test.mjs confere, com o CLI de verdade, que o resultado é equivalente.
const bloco = (seletor, vars) => `${seletor} {\n${Object.entries(vars).map(([k, v]) => `  --${k}: ${v};`).join('\n')}\n}\n`;
const regras = (obj, recuo = '') => Object.entries(obj).map(([sel, corpo]) => typeof corpo === 'string'
  ? `${recuo}${sel}: ${corpo};`
  : `${recuo}${sel} {\n${regras(corpo, recuo + '  ')}\n${recuo}}`).join('\n');

export function cssInstalado(tema, extra = '') {
  return `@import "tailwindcss";\n\n@custom-variant dark (&:is(.dark *));\n\n${bloco('@theme inline', tema.cssVars.theme)}\n` +
    `${bloco(':root', tema.cssVars.light)}\n${bloco('.dark', tema.cssVars.dark)}\n${regras(tema.css)}\n${extra}`;
}
