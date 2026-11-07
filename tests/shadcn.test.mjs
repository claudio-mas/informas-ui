// Instala os itens com o CLI real do shadcn. Precisa de rede (o CLI consulta ui.shadcn.com):
// roda na CI e quando INFORMAS_TESTE_SHADCN=1.
import test from 'node:test';
import assert from 'node:assert/strict';
import { appendFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { compile } from '@tailwindcss/node';

const SHADCN = 'shadcn@4.21.0';
const root = fileURLToPath(new URL('../', import.meta.url));
const ativo = process.env.CI || process.env.INFORMAS_TESTE_SHADCN === '1';

function shadcnAdd(cwd, ...itens) {
  // Uma string só, com caminhos relativos ao projeto: no Windows o npx passa pelo shell,
  // e um espaço no caminho do repositório quebraria o argumento.
  const run = spawnSync(`npx -y ${SHADCN} add ${itens.join(' ')} --yes --overwrite`, { cwd, encoding: 'utf8', shell: true, timeout: 180_000 });
  assert.equal(run.status, 0, run.stdout + run.stderr);
}

test('shadcn add instala o tema e o contraste num projeto Tailwind v4, e uma atualização preserva a marca', { skip: !ativo && 'defina INFORMAS_TESTE_SHADCN=1 (precisa de rede)', timeout: 400_000 }, async t => {
  mkdirSync(join(root, '.test-work'), { recursive: true });
  const app = mkdtempSync(join(root, '.test-work', 'shadcn-'));
  t.after(() => rmSync(app, { recursive: true, force: true }));
  mkdirSync(join(app, 'src/app'), { recursive: true });
  writeFileSync(join(app, 'package.json'), JSON.stringify({ name: 'app', private: true, devDependencies: { tailwindcss: '^4' } }));
  writeFileSync(join(app, 'tsconfig.json'), JSON.stringify({ compilerOptions: { baseUrl: '.', paths: { '@/*': ['./src/*'] } } }));
  writeFileSync(join(app, 'components.json'), JSON.stringify({
    $schema: 'https://ui.shadcn.com/schema.json', style: 'new-york', rsc: true, tsx: true,
    tailwind: { config: '', css: 'src/app/globals.css', baseColor: 'neutral', cssVariables: true },
    aliases: { components: '@/components', utils: '@/lib/utils', ui: '@/components/ui', lib: '@/lib', hooks: '@/hooks' },
  }));
  const globals = join(app, 'src/app/globals.css');
  writeFileSync(globals, '@import "tailwindcss";\n');
  const r = nome => relative(app, join(root, 'dist/r', `${nome}.json`)).replaceAll('\\', '/');

  shadcnAdd(app, r('tema'), r('contraste'));
  const css = readFileSync(globals, 'utf8');
  assert.match(css, /--informas-neutral-950: #141414;/);
  assert.match(css, /--color-primary: var\(--primary\);/);
  assert.match(css, /^\.dark \{/m);
  assert.ok(existsSync(join(app, 'scripts/informas-contrast.mjs')), 'script na raiz do projeto');

  const contraste = () => spawnSync(process.execPath, ['scripts/informas-contrast.mjs'], { cwd: app, encoding: 'utf8' });
  assert.equal(contraste().status, 0);

  const compilado = (await compile(readFileSync(globals, 'utf8'), { base: root, onDependency() {} })).build(['bg-primary', 'text-muted-foreground', 'dark:bg-card']);
  assert.match(compilado, /\.bg-primary \{\s*background-color: var\(--primary\);/);
  assert.match(compilado, /\.dark\\:bg-card:is\(\.dark \*\)/);

  appendFileSync(globals, '\n/* Marca */\n:root {\n  --primary: #eeeeee;\n}\n');
  assert.equal(contraste().status, 1, 'marca ruim reprova');

  shadcnAdd(app, r('tema'));
  const depois = readFileSync(globals, 'utf8');
  assert.ok(depois.trimEnd().endsWith(':root {\n  --primary: #eeeeee;\n}'), 'a marca continua no fim depois da atualização');
  assert.equal((depois.match(/--informas-neutral-950:/g) ?? []).length, 1, 'atualizar não duplica o tema');
});
