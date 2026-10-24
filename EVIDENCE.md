# Evidência e decisões de design

Inspeção realizada em 23 de outubro de 2026. O usuário autorizou a referência e fez login pessoalmente em um Chrome separado.

## Evidência do REA

| Operação | Evidência | Resultado |
|---|---|---|
| Descoberta da aba autenticada | `ev_ab189960eb5ee898408d064b33fd408ee36fddb6c90895ef65fa717a3cd9519a` | Página Inicial — OneDrive, origem `https://onedrive.live.com` |
| Inspeção passiva | `ev_ea369c67a6eb63ac806fcc6fde48d52f239609b19fb3bc06a67ed2e44fbc62e9` | 926 nós DOM; estrutura de navegação, busca, controles e grades |
| Captura da referência | `ev_529848a7969edc93e7719dbd9082cd1a09fe8aba4f025e64122add8c182791f9` | Viewport de 1920 × 945 px, captura do conteúdo visível |
| Captura inicial da implementação | `ev_719a8259f40e0b9900911f8a8177464c75ff6e4541fa089b5b7185d5c00b6875` | Mesmo viewport, cenário completo, nenhum erro de página |

O REA inspecionou passivamente a página inicial e capturou seus pixels. Nenhum documento foi aberto e nenhuma ação de escrita foi executada na conta. A inspeção desabilitou fontes de scripts, texto da acessibilidade, texto de console, corpos de rede e chaves/valores de armazenamento. Recursos de outras origens foram excluídos. Não se trata de extração integral de estilos computados ou do design system interno da Microsoft.

As evidências da referência permanecem no contexto de análise. O pacote contém somente capturas da implementação com nomes fictícios. Os identificadores documentam a procedência da sessão; não são links públicos de consulta.

## Medido na imagem enviada

| Propriedade | Valor | Método |
|---|---|---|
| Fundo geral | `#FCFCFC` | Amostra de pixel em região vazia |
| Superfície da tabela | `#FFFFFF` | Amostra de pixel |
| Divisória de linha | `#F0F0F0` | Amostra de pixel |
| Borda sutil | `#EBEBEB` | Amostra de pixel |
| Indicador de navegação ativa | `#0F6CBD` | Amostra de pixel |

## Proporções da captura autenticada

Medições aproximadas em pixels de imagem, usadas como parâmetros iniciais da implementação:

- Navegação lateral: 280 px de área reservada; início do conteúdo em x≈296.
- Barra superior: 64 px de área reservada; busca central próxima de 480 × 36 px.
- Aviso: aproximadamente 58 px de altura, borda de 1 px e raio próximo de 12 px.
- Cartões de aplicativos: aproximadamente 227 × 62 px, intervalo de 8 px.
- Cabeçalho da tabela: aproximadamente 48 px; linhas: 56 px.
- Margens e ritmo: escala recorrente próxima de múltiplos de 4 px.

São medidas visuais aproximadas, não valores CSS internos comprovados. Não foi afirmado um zoom de navegador que o REA não informou. A renderização da implementação usa escala de dispositivo 1 e viewport explicitamente definido.

## Fundamentos documentados

- [Tokens do Fluent 2](https://fluent2.microsoft.design/design-tokens): separação entre valores globais e semânticos para consistência e personalização.
- [Tipografia Fluent 2](https://fluent2.microsoft.design/typography): Segoe UI; corpo 14/20 px, legenda 12/16 px, subtítulo 16/22 px e título 24/32 px.

Esses fundamentos orientam o kit. Não demonstram, por si só, quais tokens privados o OneDrive usa em produção.

## Decisões próprias

- Nome Cloudscape UI; símbolos próprios para documentos e aplicativos.
- Componentes React controlados e CSS com prefixo para integração em outros projetos.
- JSON como fonte única dos tokens.
- Estados de hover, foco, seleção, vazio e carregamento; comportamentos de menu e tabela.
- Adaptação abaixo de 760 px, navegação lateral em painel e rolagem horizontal interna da tabela.
- Catálogo de fundamentos e variações de cor; demonstração autossuficiente.
- Gradiente principal, cores auxiliares, sombras e raios aproximados visualmente onde não houve medida direta.

Não houve validação da conta em mobile, de tema escuro ou de todas as interações do OneDrive. O kit oferece equivalência visual da tela inicial e componentes reutilizáveis, com adaptações documentadas.


## Extensão 1.1 — temas

Solicitada após a entrega inicial: Claro, Escuro e Sistema, com preferência local persistida. O tema claro conserva os valores de base observados; o tema escuro usa uma paleta própria orientada por contraste. Nenhuma nova inspeção da conta Microsoft foi necessária para essa adaptação.

Validação REA da aplicação local: sistema escuro automático `ev_6369adef9aa7bc9c956e284483468a3343d0ea5132f5ff0358b6b4d97d0e8c3a`; escolha explícita de Claro sobre sistema escuro `ev_722f4859f7adad7df67cc3da5b2e7973e7d5e9d7c4724994785ca1f0d17f6af7`. Ambas as execuções concluíram sem erros de página e encerraram seus próprios processos de navegador.
