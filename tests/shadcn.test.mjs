// Instala os itens com o CLI real do shadcn. Precisa de rede (o CLI consulta ui.shadcn.com):
// roda na CI e quando INFORMAS_TESTE_SHADCN=1.
import test from 'node:test';
import assert from 'node:assert/strict';
import { appendFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { compile } from '@tailwindcss/node';

const SHADCN = 'shadcn@4.21.0';
const root = fileURLToPath(new URL('../', import.meta.url));
const ativo = process.env.CI || process.env.INFORMAS_TESTE_SHADCN === '1';

/**
 * Assíncrono de propósito: o teste com todos os componentes serve o registro por HTTP
 * neste mesmo processo, e um spawnSync bloquearia o servidor enquanto o CLI espera a resposta.
 * Uma string só, com caminhos relativos ao projeto: no Windows o npx passa pelo shell, e um
 * espaço no caminho do repositório quebraria o argumento. Entrada fechada: com ela aberta,
 * o CLI fica esperando durante a instalação das dependências.
 */
function rodar(comando, cwd, limite = 300_000) {
  return new Promise((resolve) => {
    const filho = spawn(comando, { cwd, shell: true, stdio: ['ignore', 'pipe', 'pipe'] });
    let saida = '';
    filho.stdout.on('data', (d) => { saida += d; });
    filho.stderr.on('data', (d) => { saida += d; });
    const relogio = setTimeout(() => { saida += `\n[tempo esgotado: ${limite} ms]`; filho.kill(); }, limite);
    filho.on('close', (status) => { clearTimeout(relogio); resolve({ status, saida }); });
  });
}

async function shadcnAdd(cwd, ...itens) {
  const { status, saida } = await rodar(`npx -y ${SHADCN} add ${itens.join(' ')} --yes --overwrite`, cwd);
  assert.equal(status, 0, saida);
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

  await shadcnAdd(app, r('tema'), r('contraste'));
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

  await shadcnAdd(app, r('tema'));
  const depois = readFileSync(globals, 'utf8');
  assert.ok(depois.trimEnd().endsWith(':root {\n  --primary: #eeeeee;\n}'), 'a marca continua no fim depois da atualização');
  assert.equal((depois.match(/--informas-neutral-950:/g) ?? []).length, 1, 'atualizar não duplica o tema');
});

test('shadcn add instala todos os componentes num projeto com outros aliases, e o projeto compila', { skip: !ativo && 'defina INFORMAS_TESTE_SHADCN=1 (precisa de rede)', timeout: 900_000 }, async t => {
  const { createServer } = await import('node:http');
  const indice = JSON.parse(readFileSync(join(root, 'dist/r/registry.json'), 'utf8'));
  // Serve dist/r por HTTP, como o release do GitHub.
  const servidor = createServer((req, res) => {
    const arquivo = join(root, 'dist/r', decodeURIComponent(new URL(req.url, 'http://x').pathname).replace(/^\//, ''));
    if (!existsSync(arquivo)) { res.writeHead(404).end(); return; }
    res.writeHead(200, { 'content-type': 'application/json' }).end(readFileSync(arquivo));
  });
  await new Promise(ok => servidor.listen(0, '127.0.0.1', ok));
  t.after(() => servidor.close());
  const porta = servidor.address().port;

  mkdirSync(join(root, '.test-work'), { recursive: true });
  const app = mkdtempSync(join(root, '.test-work', 'shadcn-todos-'));
  t.after(() => rmSync(app, { recursive: true, force: true }));
  mkdirSync(join(app, 'src/app'), { recursive: true });
  writeFileSync(join(app, 'package.json'), JSON.stringify({
    name: 'app', private: true, type: 'module',
    dependencies: { react: '^19', 'react-dom': '^19' },
    devDependencies: { tailwindcss: '^4', typescript: '^5', '@types/react': '^19', '@types/react-dom': '^19' },
  }));
  writeFileSync(join(app, 'tsconfig.json'), JSON.stringify({
    compilerOptions: { target: 'ES2022', lib: ['ES2022', 'DOM', 'DOM.Iterable'], module: 'ESNext', moduleResolution: 'Bundler', jsx: 'react-jsx', strict: true, noEmit: true, skipLibCheck: true, paths: { '@/*': ['./src/*'] } },
    include: ['src'],
  }));
  // Aliases diferentes dos do registro, para provar que o CLI reescreve os imports.
  writeFileSync(join(app, 'components.json'), JSON.stringify({
    $schema: 'https://ui.shadcn.com/schema.json', style: 'new-york', rsc: true, tsx: true,
    tailwind: { config: '', css: 'src/app/globals.css', baseColor: 'neutral', cssVariables: true },
    iconLibrary: 'lucide',
    aliases: { components: '@/ds', utils: '@/ds/lib/utils', ui: '@/ds/ui', lib: '@/ds/lib', hooks: '@/ds/hooks' },
    registries: { '@informas': `http://127.0.0.1:${porta}/{name}.json` },
  }));
  writeFileSync(join(app, 'src/app/globals.css'), '@import "tailwindcss";\n');

  const instalar = await rodar('npm install --no-audit --no-fund', app);
  assert.equal(instalar.status, 0, instalar.saida);

  const nomes = indice.items.map(i => `@informas/${i.name}`).filter(n => n !== '@informas/contraste');
  await shadcnAdd(app, ...nomes);

  const ui = join(app, 'src/ds/ui');
  for (const item of indice.items.filter(i => i.type === 'registry:ui')) assert.ok(existsSync(join(ui, `${item.name}.tsx`)), `${item.name}.tsx em @/ds/ui`);
  assert.ok(existsSync(join(app, 'src/ds/hooks/use-mobile.ts')));
  assert.ok(existsSync(join(app, 'src/ds/lib/theme-mode.ts')));
  assert.ok(existsSync(join(app, 'src/ds/app-shell.tsx')), 'bloco em @/ds');
  const sidebar = readFileSync(join(ui, 'sidebar.tsx'), 'utf8');
  assert.match(sidebar, /from "@\/ds\/ui\/button"/);
  assert.match(sidebar, /from "@\/ds\/hooks\/use-mobile"/);
  assert.doesNotMatch(sidebar, /@\/registry\//, 'nenhum import do registro sobra');

  const tsc = await rodar('npx tsc -p tsconfig.json', app);
  assert.equal(tsc.status, 0, tsc.saida);

  const pkg = JSON.parse(readFileSync(join(app, 'package.json'), 'utf8'));
  for (const dep of ['radix-ui', 'cn', 'class-variance-authority', 'lucide-react', 'sonner', '@tanstack/react-table']) assert.ok(pkg.dependencies[dep], `${dep} instalado`);
  assert.ok(!pkg.dependencies['next-themes'], 'sem next-themes');
});
