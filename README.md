# informas-ui

Base neutra de design system para aplicações web comerciais/SaaS. Cada aplicação aplica a própria marca por cima.

- **Tokens semânticos** com os nomes do [shadcn/ui](https://ui.shadcn.com/) (`background`, `primary`, `muted`, `ring`, `sidebar`…), mais os estados `info`, `success`, `warning` e `destructive`.
- **Tema para Tailwind CSS v4** (`bg-primary`, `text-muted-foreground`, `border-input`…), com modo escuro pela classe `.dark`.
- **Verificação de contraste WCAG** dos tokens e do CSS de marca de cada aplicação.

> Fase atual: **2.0.0-alpha.0 (fundação de tokens)**. Os componentes React chegam na fase 2. A versão anterior (Cloudscape UI 1.1.0) está em [`legacy/`](legacy/).

## Instalar

O pacote ainda não está num registro. Por enquanto, instale o `.tgz` anexado ao [release](https://github.com/claudio-mas/informas-ui/releases) ou gerado por `npm pack`:

```sh
npm install /caminho/informas-ui-2.0.0-alpha.0.tgz
```

## Usar com Tailwind CSS v4

No CSS de entrada da aplicação:

```css
@import "tailwindcss";
@import "informas-ui/theme.css";
@import "./brand.css"; /* a marca da aplicação, sempre depois do tema */

@layer base {
  * { @apply border-border outline-ring/50; }
  body { @apply bg-background text-foreground font-sans; }
}
```

```tsx
<button className="rounded-lg bg-primary px-4 py-2 text-primary-foreground focus-visible:ring-2 focus-visible:ring-ring">
  Salvar
</button>
<p className="rounded-md bg-warning-subtle p-3 text-warning-subtle-foreground">Pagamento pendente.</p>
```

Modo escuro: adicione `class="dark"` ao `<html>`. Os componentes do shadcn/ui funcionam sem ajuste, porque usam os mesmos nomes de tokens.

## Usar sem Tailwind

```css
@import "informas-ui/tokens.css";

.botao { background: var(--primary); color: var(--primary-foreground); border-radius: var(--radius); }
```

`informas-ui/tokens.json` traz os valores resolvidos dos dois temas, para uso em JavaScript, gráficos ou ferramentas de design.

## Aplicar a marca

Crie um `brand.css` na aplicação ([exemplo](themes/exemplo-marca.css)) e sobrescreva **apenas tokens semânticos** ou escalas primitivas:

```css
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

- O que estiver só em `:root` também vale no tema escuro, porque o `brand.css` vem depois do `.dark` da base. Declare em `.dark` tudo o que precisar mudar no escuro.
- Para mudar o tom de todos os cinzas (por exemplo, cinzas quentes), redefina as primitivas `--informas-neutral-0` a `--informas-neutral-950`: os tokens semânticos as referenciam.
- Use cores CSS completas (`#hex`, `rgb()`, `hsl()`, `oklch()`). Trios soltos como `221 83% 53%` (padrão antigo do shadcn) não funcionam.

Valide a marca antes de publicar:

```sh
npx informas-contrast src/brand.css
```

A CLI aplica o arquivo sobre a base, simula a cascata nos temas claro e escuro e sai com código 1 se algum par ficar abaixo do mínimo: 4,5:1 para texto e 3:1 para bordas de campo, foco, preenchimentos e cores de gráfico. Coloque-a na CI da aplicação.

## Tokens

| Grupo | Tokens |
|---|---|
| Superfícies | `background`, `card`, `popover`, `sidebar`, cada um com `-foreground` |
| Ações | `primary`, `secondary`, `accent`, cada um com `-foreground` |
| Apoio | `muted`, `muted-foreground`, `border`, `input`, `ring` |
| Estados | `info`, `success`, `warning`, `destructive` + `-foreground`, `-subtle`, `-subtle-foreground` |
| Gráficos | `chart-1` a `chart-5` |
| Barra lateral | `sidebar-primary`, `sidebar-accent`, `sidebar-border`, `sidebar-ring` e pares |
| Forma e texto | `radius` (gera `rounded-sm` a `rounded-xl`), `font-family-sans`, `font-family-mono` |

Primitivas: `--informas-{neutral,blue,green,amber,red}-{50…950}` (e `neutral-0`). Elas existem para compor temas; componentes e telas devem usar os tokens semânticos.

`input` é mais escuro que `border` de propósito: bordas de campo precisam de 3:1 contra o fundo (WCAG 1.4.11), divisórias não.

## Desenvolver

Node.js 24 (ver `.nvmrc`).

```sh
npm ci
npm run build          # tokens (dist/) e a v1 em legacy/
npm test               # tokens, contraste, Tailwind, conteúdo do pacote e testes da v1
npm run check:contrast # relatório completo de contraste
npm pack               # gera informas-ui-<versão>.tgz
```

| Caminho | Conteúdo |
|---|---|
| `tokens/` | Fonte da verdade: primitivas, semânticos e pares de contraste |
| `scripts/` | Build dos tokens e CLI de contraste |
| `themes/` | Tema de exemplo de marca |
| `tests/` | Testes da base nova |
| `legacy/` | Cloudscape UI 1.1.0, só para referência (não publicado) |
| `dist/` | Gerado; não versionado |

Para alterar um token, edite `tokens/*.json`, rode `npm test` e registre a mudança no `CHANGELOG.md`.

## Versões e releases

- SemVer. Mudar o nome ou remover um token é breaking change.
- Para lançar: atualize `version` no `package.json` e o `CHANGELOG.md`, crie a tag `v<versão>` e envie. O workflow `release.yml` testa, empacota e publica o `.tgz` com `SHA256SUMS` no GitHub.

## Licença

MIT. Não é afiliado à Microsoft, à AWS nem ao projeto shadcn/ui.
