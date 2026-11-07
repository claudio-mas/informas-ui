# informas-ui

Design system para aplicações web comerciais/SaaS, distribuído como **registro shadcn**. A base é neutra e cada aplicação aplica a própria marca por cima.

- **Tokens semânticos** com os nomes do [shadcn/ui](https://ui.shadcn.com/) (`background`, `primary`, `muted`, `ring`, `sidebar`…), mais os estados `info`, `success`, `warning` e `destructive`.
- **30 componentes e o bloco `app-shell`**, a partir do shadcn/ui, ajustados aos tokens, ao contraste WCAG e ao pt-BR: formulários, avisos, sobreposições, tabela de dados, navegação e estrutura de aplicação.
- **Tema para Tailwind CSS v4** com modo escuro pela classe `.dark` e seletor Claro/Escuro/Sistema.
- **Verificação de contraste WCAG** do CSS do próprio projeto, incluindo a marca.

> Fase atual: **2.0.0-alpha.2 (tokens e primeiro lote de componentes)**. A versão anterior (Cloudscape UI 1.1.0) está em [`legacy/`](legacy/).

## Itens do registro

| Item | O que instala |
|---|---|
| `@informas/tema` | Escalas primitivas `--informas-*`, tokens semânticos em `:root` e `.dark`, mapeamento `@theme inline` e estilos base. Tudo no CSS do projeto. Todo componente depende dele. |
| `@informas/contraste` | `scripts/informas-contrast.mjs`: verifica 39 pares de contraste por tema no CSS do projeto. |
| Formulários | `button`, `input`, `textarea`, `label`, `field`, `native-select`, `select`, `checkbox`, `radio-group`, `switch` |
| Feedback e conteúdo | `alert`, `badge`, `card`, `skeleton`, `empty`, `separator`, `tabs` |
| Sobreposições | `dialog`, `alert-dialog`, `dropdown-menu`, `popover`, `tooltip`, `sheet`, `sonner` |
| Dados e navegação | `table`, `data-table`, `pagination`, `breadcrumb`, `sidebar`, `theme-switcher` |
| Apoio | `theme-mode` (script e hook do tema), `use-mobile` |
| Bloco | `app-shell`: barra lateral, topo, link para pular ao conteúdo e seletor de tema |

O shadcn copia: depois do `add`, o código é do projeto. Não há pacote npm. As dependências npm de cada componente (`radix-ui`, `cn`, `lucide-react`, `@tanstack/react-table`…) são instaladas pelo próprio CLI.

## Instalar num projeto

Requisitos: Tailwind CSS v4 e um `components.json`. Se o projeto não usa shadcn ainda, crie o `components.json` à mão em vez de rodar `shadcn init`, porque o `init` escreve o tema padrão do shadcn no seu CSS:

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": true,
  "tsx": true,
  "tailwind": { "config": "", "css": "src/app/globals.css", "baseColor": "neutral", "cssVariables": true },
  "aliases": { "components": "@/components", "utils": "@/lib/utils", "ui": "@/components/ui", "lib": "@/lib", "hooks": "@/hooks" },
  "registries": {
    "@informas": "https://github.com/claudio-mas/informas-ui/releases/download/v2.0.0-alpha.2/{name}.json"
  }
}
```

Ajuste `tailwind.css` para o CSS de entrada do projeto. A URL fixa a versão; para atualizar, troque a tag.

Depois:

```sh
npx shadcn@latest add @informas/tema @informas/contraste
```

O CSS de entrada fica com `@custom-variant dark`, o bloco `@theme inline`, o `:root`, o `.dark` e o `@layer base`. Use:

```tsx
<button className="rounded-lg bg-primary px-4 py-2 text-primary-foreground focus-visible:ring-2 focus-visible:ring-ring">
  Salvar
</button>
<p className="rounded-md bg-warning-subtle p-3 text-warning-subtle-foreground">Pagamento pendente.</p>
```

Modo escuro: `class="dark"` no `<html>`. Os componentes do shadcn/ui funcionam sem ajuste, porque usam os mesmos nomes de tokens.

## Componentes

```sh
npx shadcn@latest add @informas/button @informas/field @informas/input @informas/dialog
# ou tudo:
npx shadcn@latest add @informas/app-shell @informas/data-table @informas/sonner @informas/tooltip …
```

Os arquivos vão para os aliases do `components.json` (por exemplo `@/components/ui/button.tsx`), e o CLI reescreve os imports entre eles. A API é a do shadcn/ui, então a documentação dele vale. Configuração de raiz:

- **Tema:** `themeScript()` (de `@informas/theme-mode`) antes da hidratação. No Next.js, `<Script id="tema" strategy="beforeInteractive">{themeScript()}</Script>` no layout raiz; no Vite, o conteúdo num `<script>` no `<head>`. O `ThemeSwitcher` e o `AppShell` gravam a escolha (chave padrão `theme`, configurável).
- **Tooltip:** envolva a aplicação com `<TooltipProvider>`.
- **Notificações:** `<Toaster />` uma vez no layout raiz; `toast()` vem do pacote `sonner`.

### O que muda em relação ao shadcn/ui

- **Foco** com anel sólido de 2 px e deslocamento (`ring-ring`), no lugar do anel de 3 px a 50% de opacidade, que com a cor da marca pode ficar abaixo de 3:1.
- **Destrutivo** com `text-destructive-foreground` em vez de `text-white`: no tema escuro o vermelho é claro e leva texto escuro.
- **Campos** sem tingimento `dark:bg-input/30`, porque aqui `input` é a borda de 3:1, não um cinza sutil.
- **`Alert`** com variantes `info`, `success`, `warning` e `destructive` sobre os pares `*-subtle`. O `role` padrão é `alert` só em `destructive` e `warning`, e `status` nos demais; passe `role={undefined}` em avisos estáticos.
- **`Badge`** com `success`, `warning` e `info`.
- **`Toaster`** sem `next-themes`: segue a classe `.dark` do `<html>`.
- **`Sidebar`** sem `cssVars` próprios: os tokens da barra lateral vêm do tema.
- **`DataTable`** (não existe no shadcn), sobre o TanStack Table 9: `aria-sort` nos cabeçalhos, busca que ignora acentos ("sao paulo" encontra "São Paulo"), ordenação numérica correta com negativos (`sortFn: "numeric"`) e paginação em pt-BR.
- **Textos** em pt-BR: "Fechar", "Anterior", "Próxima", "Alternar barra lateral", "Trilha de navegação"…
- Cada arquivo derivado traz a atribuição ao shadcn/ui (MIT).

## Aplicar a marca

Cole um bloco de marca **no fim** do CSS de entrada, abaixo das variáveis do tema ([exemplo](themes/exemplo-marca.css)). Sobrescreva só tokens semânticos ou escalas primitivas:

```css
/* Marca do projeto */
:root {
  --primary: oklch(0.48 0.09 185);
  --primary-foreground: var(--informas-neutral-0);
  --ring: var(--primary);
  --radius: 0.75rem;
  --font-family-sans: "Inter", ui-sans-serif, system-ui, sans-serif;
}
.dark {
  --primary: oklch(0.78 0.1 185);
  --primary-foreground: var(--informas-neutral-950);
}
```

- Por estar no fim, o bloco vence na cascata. Ao atualizar o tema, o CLI altera o primeiro `:root`/`.dark` e mantém a marca no fim.
- O que estiver só em `:root` também vale no tema escuro. Declare em `.dark` o que precisar mudar no escuro.
- Para mudar o tom de todos os cinzas, redefina `--informas-neutral-0` a `--informas-neutral-950`: os tokens semânticos apontam para eles.
- Use cores CSS completas (`#hex`, `rgb()`, `hsl()`, `oklch()`). Trios soltos como `221 83% 53%` (padrão antigo do shadcn) não funcionam.

Valide antes de publicar e coloque na CI do projeto:

```sh
node scripts/informas-contrast.mjs          # lê o CSS indicado no components.json
node scripts/informas-contrast.mjs a.css b.css   # ou arquivos explícitos, na ordem da cascata
```

Sai com código 1 se algum par ficar abaixo do mínimo: 4,5:1 para texto, 3:1 para bordas de campo, foco, preenchimentos e cores de gráfico.

## Atualizar

Troque a tag na URL do `components.json` e rode de novo:

```sh
npx shadcn@latest add @informas/tema @informas/contraste --overwrite
```

Confira o diff do CSS e o [CHANGELOG](CHANGELOG.md): renomear ou remover um token é breaking change.

## O que o CLI do shadcn acrescenta por conta própria

- **`@custom-variant dark (&:is(.dark *))`**: o `dark:` vale para descendentes de `.dark`.
- **Linhas `--x: var(--x)` no `@theme inline`**, uma por token semântico. O CLI as cria para valores que não reconhece como cor. O Tailwind as emite na camada `theme`, mas elas perdem para os valores reais em `:root`/`.dark`, que ficam fora de camada. São inofensivas.
- **Utilitários das primitivas** (`bg-informas-blue-500`…), porque os valores hex parecem cores ao CLI. Existem, mas em telas e componentes prefira os semânticos.

## Tokens

| Grupo | Tokens |
|---|---|
| Superfícies | `background`, `card`, `popover`, `sidebar`, cada um com `-foreground` |
| Ações | `primary`, `secondary`, `accent`, cada um com `-foreground` |
| Apoio | `muted`, `muted-foreground`, `border`, `input`, `ring` |
| Estados | `info`, `success`, `warning`, `destructive` + `-foreground`, `-subtle`, `-subtle-foreground` |
| Gráficos | `chart-1` a `chart-5` |
| Barra lateral | `sidebar-primary`, `sidebar-accent`, `sidebar-border`, `sidebar-ring` e pares |
| Forma e texto | `radius` (gera `rounded-sm` a `rounded-4xl`), `font-family-sans`, `font-family-mono` |

`input` é mais escuro que `border` de propósito: bordas de campo precisam de 3:1 contra o fundo (WCAG 1.4.11), divisórias não.

## Desenvolver

Node.js 24 (ver `.nvmrc`).

```sh
npm ci
npm run build          # registro (dist/r/) e a v1 em legacy/
npm test               # tipos, tokens, contraste, Tailwind, itens do registro e testes da v1
npm run dev:catalog    # catálogo de componentes em http://127.0.0.1:5173
npm run test:browser   # catálogo com axe (WCAG 2.1 AA), claro e escuro, sobreposições abertas
npm run check:contrast # relatório de contraste dos tokens base
```

- Os testes com o CLI real do shadcn (`tests/shadcn.test.mjs`) precisam de rede: rodam na CI e localmente com `INFORMAS_TESTE_SHADCN=1`. Um deles instala todos os componentes num projeto com aliases diferentes e o compila com TypeScript.
- O catálogo (`catalog/`) monta todos os componentes dentro do `AppShell`. A CI publica as capturas como artefato.

| Caminho | Conteúdo |
|---|---|
| `tokens/` | Fonte da verdade dos tokens: primitivas, semânticos e pares de contraste |
| `registry/informas/` | Código dos componentes (`ui/`, `hooks/`, `lib/`, `blocks/`) |
| `registry/items.json` | Manifesto: nome, tipo e descrição de cada item. As dependências são derivadas dos imports |
| `scripts/` | Geração do registro e verificação de contraste |
| `catalog/` | Catálogo de componentes (Vite) |
| `tests/` | Testes de Node e, em `tests/navegador/`, de navegador |
| `themes/` | Exemplo de bloco de marca |
| `legacy/` | Cloudscape UI 1.1.0, só para referência |
| `dist/r/` | Gerado: itens do registro; não versionado |

Para acrescentar um componente: crie o arquivo em `registry/informas/`, importando os outros por `@/registry/informas/...`, registre-o em `registry/items.json`, coloque-o no catálogo e rode `npm test` e `npm run test:browser`.

## Versões e releases

- SemVer. Renomear ou remover um token é breaking change.
- Para lançar: atualize `version` no `package.json` e o `CHANGELOG.md`, crie a tag `v<versão>` e envie. O `release.yml` testa e anexa todos os itens (`dist/r/*.json`) e `SHA256SUMS` ao release; esse é o endereço do registro.

## Licença

MIT. Os componentes derivam do [shadcn/ui](https://github.com/shadcn-ui/ui) (MIT, © 2023 shadcn). Não é afiliado à Microsoft, à AWS nem ao projeto shadcn/ui.
