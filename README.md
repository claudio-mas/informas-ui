# informas-ui

Base neutra de design system para aplicações web comerciais/SaaS, distribuída como **registro shadcn**. Cada aplicação aplica a própria marca por cima.

- **Tokens semânticos** com os nomes do [shadcn/ui](https://ui.shadcn.com/) (`background`, `primary`, `muted`, `ring`, `sidebar`…), mais os estados `info`, `success`, `warning` e `destructive`.
- **Tema para Tailwind CSS v4** (`bg-primary`, `text-muted-foreground`, `border-input`…), com modo escuro pela classe `.dark`.
- **Verificação de contraste WCAG** do CSS do próprio projeto, incluindo a marca.

> Fase atual: **2.0.0-alpha.1 (fundação de tokens)**. Os componentes chegam na fase 2, como itens do mesmo registro. A versão anterior (Cloudscape UI 1.1.0) está em [`legacy/`](legacy/).

## Itens do registro

| Item | O que instala |
|---|---|
| `@informas/tema` | Escalas primitivas `--informas-*`, tokens semânticos em `:root` e `.dark`, mapeamento `@theme inline` para o Tailwind e estilos base (`body`, cor de borda e de foco). Tudo no CSS do projeto. |
| `@informas/contraste` | `scripts/informas-contrast.mjs`: um script sem dependências que verifica 39 pares de contraste por tema no CSS do projeto. |

O shadcn copia: depois do `add`, o código é do projeto. Não há pacote npm.

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
    "@informas": "https://github.com/claudio-mas/informas-ui/releases/download/v2.0.0-alpha.1/{name}.json"
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
npm test               # tokens, contraste, Tailwind, itens do registro e testes da v1
npm run check:contrast # relatório de contraste dos tokens base
```

O teste com o CLI real do shadcn (`tests/shadcn.test.mjs`) precisa de rede: roda na CI e localmente com `INFORMAS_TESTE_SHADCN=1`.

Para experimentar os itens sem publicar, aponte o `add` para os arquivos locais: `npx shadcn@latest add /caminho/informas-ui/dist/r/tema.json`.

| Caminho | Conteúdo |
|---|---|
| `tokens/` | Fonte da verdade: primitivas, semânticos e pares de contraste |
| `scripts/` | Geração do registro e verificação de contraste |
| `themes/` | Exemplo de bloco de marca |
| `tests/` | Testes da base |
| `legacy/` | Cloudscape UI 1.1.0, só para referência |
| `dist/r/` | Gerado: itens do registro; não versionado |

## Versões e releases

- SemVer. Renomear ou remover um token é breaking change.
- Para lançar: atualize `version` no `package.json` e o `CHANGELOG.md`, crie a tag `v<versão>` e envie. O `release.yml` testa e anexa `registry.json`, `tema.json`, `contraste.json` e `SHA256SUMS` ao release; esse é o endereço do registro.

## Licença

MIT. Não é afiliado à Microsoft, à AWS nem ao projeto shadcn/ui.
