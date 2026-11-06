import { readFile, writeFile } from 'node:fs/promises';
const tokens = JSON.parse(await readFile(new URL('../tokens.json', import.meta.url), 'utf8'));
const darkTokens = JSON.parse(await readFile(new URL('../tokens.dark.json', import.meta.url), 'utf8'));
export function tokenEntries(value, prefix = []) {
  return Object.entries(value).flatMap(([key, item]) => typeof item === 'object' ? tokenEntries(item, [...prefix, key]) : [[`--cs-${[...prefix, key].join('-')}`, String(item)]]);
}
const declarations = value => tokenEntries(value).map(([key,item]) => `  ${key}: ${item};`).join('\n');
const lightAppearance={color:tokens.color,shadow:tokens.shadow};
const css = `/* Generated from tokens.json + tokens.dark.json. */\n:root {\n  color-scheme: light;\n${declarations(tokens)}\n}\n:root[data-cs-theme="dark"], .cs-ui[data-cs-theme="dark"] {\n  color-scheme: dark;\n${declarations(darkTokens)}\n}\n.cs-ui[data-cs-theme="light"] {\n  color-scheme: light;\n${declarations(lightAppearance)}\n}\n@media (prefers-color-scheme: dark) {\n  :root:not([data-cs-theme="light"]):not([data-cs-theme="dark"]) {\n    color-scheme: dark;\n${declarations(darkTokens)}\n  }\n}\n`;
await writeFile(new URL('../tokens.css', import.meta.url), css);
console.log(`Generated ${tokenEntries(tokens).length} base tokens and ${tokenEntries(darkTokens).length} dark overrides.`);
