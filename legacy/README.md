# legacy/ — Cloudscape UI 1.1.0

Esta pasta guarda a versão 1 do kit, publicada como `cloudscape-ui` (tag `v1.1.0`). Ela fica aqui apenas como referência enquanto a fase 2 do informas-ui (componentes React sobre Radix/shadcn) não substitui estes componentes.

- **Não faz parte do pacote `informas-ui`.** Nada daqui é publicado.
- Mantém a identidade visual antiga (Segoe UI, azul e gradiente de marca, cores de tipos de arquivo), que o informas-ui abandonou.
- Usa outro mecanismo de tema (`data-cs-theme`) e prefixo próprio (`cs-`, `--cs-`), incompatíveis com a base nova.

Comandos, a partir da raiz do repositório:

```sh
npm run dev:legacy     # demonstração em http://127.0.0.1:5173
npm run build:legacy   # gera legacy/dist, legacy/preview e legacy/DEMO.html
npm run test:legacy
```

Documentação original: [docs/](docs/).
