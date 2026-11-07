# Changelog

Formato baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/). Versões seguem [SemVer](https://semver.org/lang/pt-BR/).

## [Não lançado]

## [2.0.0-alpha.1] — registro shadcn

A distribuição passa a ser **só pelo registro shadcn**, hospedado nos assets dos releases do GitHub.

### Adicionado
- Item `@informas/tema` (`registry:theme`): primitivas `--informas-*`, tokens semânticos em `:root`/`.dark`, mapeamento explícito `@theme inline` (cores, raios `sm` a `4xl`, fontes) e estilos base.
- Item `@informas/contraste`: `scripts/informas-contrast.mjs`, script único sem dependências que verifica o CSS do próprio projeto. Sem argumentos, lê o CSS do `components.json`.
- Teste de instalação com o CLI real do shadcn (instala, compila com Tailwind, verifica contraste e confirma que atualizar preserva a marca no fim do CSS).

### Removido
- **Breaking:** o pacote npm. Saem os exports `informas-ui/theme.css`, `tokens.css`, `tokens.json` e o bin `informas-contrast`. O release não anexa mais `.tgz`.

## [2.0.0-alpha.0] — fundação

O projeto passa a se chamar **informas-ui** e deixa de ser um kit inspirado no OneDrive para ser uma base neutra de design system para aplicações SaaS, em que cada aplicação aplica a própria marca.

### Adicionado
- Tokens em dois níveis: escalas primitivas neutras (`tokens/primitives.json`, variáveis `--informas-*`) e tokens semânticos com os nomes do shadcn/ui (`tokens/semantic.json`).
- Estados `info`, `success`, `warning` e `destructive`, cada um com preenchimento, texto sobre o preenchimento, fundo suave e texto sobre o fundo suave.
- `dist/theme.css` para Tailwind CSS v4 (`@theme inline`, modo escuro pela classe `.dark`), `dist/tokens.css` em CSS puro e `dist/tokens.json` com os valores resolvidos.
- CLI `informas-contrast`: verifica 39 pares de contraste WCAG por tema (4,5:1 para texto, 3:1 para bordas de campo, foco, preenchimentos e gráficos), com ou sem o CSS de marca da aplicação. Reprova a CI quando um par fica abaixo do mínimo.
- Tema de exemplo `themes/exemplo-marca.css`.
- CI (build, testes, pacote) e workflow de release por tag.

### Alterado
- **Breaking:** pacote renomeado de `cloudscape-ui` para `informas-ui`; exports `tokens.css`/`tokens.json` agora apontam para a base nova.
- **Breaking:** tema escuro pela classe `.dark` em vez de `data-cs-theme`.
- Arquivos gerados (`dist/`, `preview/`, `DEMO.html`, `.tgz`) saíram do controle de versão; ficam nos releases.

### Removido do pacote
- Componentes React, `components.css` e a demonstração da 1.1.0 foram movidos para `legacy/` e não são publicados. Serão substituídos na fase 2.

## [1.1.0] — Cloudscape UI

Última versão com o nome `cloudscape-ui`. Tokens `--cs-*`, 18 componentes React, temas Claro/Escuro/Sistema. Código preservado em `legacy/` e na tag `v1.1.0`.

[Não lançado]: https://github.com/claudio-mas/informas-ui/compare/v2.0.0-alpha.1...HEAD
[2.0.0-alpha.1]: https://github.com/claudio-mas/informas-ui/compare/v2.0.0-alpha.0...v2.0.0-alpha.1
[2.0.0-alpha.0]: https://github.com/claudio-mas/informas-ui/compare/v1.1.0...v2.0.0-alpha.0
[1.1.0]: https://github.com/claudio-mas/informas-ui/releases/tag/v1.1.0
