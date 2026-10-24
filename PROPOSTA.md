# Design system inspirado na página inicial do OneDrive

Status: proposta aprovada pelo usuário; inspeção autenticada realizada com REA.

## Objetivo

Criar uma base visual reutilizável para aplicações web, com a aparência e a organização da tela inicial do OneDrive fornecida como referência. Entregar CSS, tokens e componentes React, conforme a preferência informada pelo usuário.

O resultado deverá servir tanto para compor outras telas quanto para reproduzir o padrão de uma aplicação de documentos. A demonstração utilizará marca própria e conteúdo fictício.

## Referências e evidência

- Captura de tela fornecida pelo usuário: 1907 × 946 pixels.
- Página inicial autenticada em https://onedrive.live.com/, inspecionada pelo REA em um Chrome separado autorizado pelo usuário. Captura real: 1920 × 945 pixels.
- Documentação oficial do Fluent 2 para a terminologia e os fundamentos de tipografia e tokens.

Cada decisão final receberá uma origem: observada na página via REA, medida na captura de tela, documentada pelo Fluent ou proposta para a implementação. Uma medida da captura não será apresentada como uma variável CSS extraída da aplicação.

## Abordagem

Foram consideradas uma base somente em CSS e tokens, uma biblioteca apenas em React, e uma base compartilhada em CSS e tokens acompanhada de componentes React. O usuário escolheu CSS e tokens com componentes React.

Proposta técnica: usar CSS com variáveis semânticas e componentes React em TypeScript, sem exigir uma biblioteca visual adicional. Isso permite aproveitar os mesmos estilos em outros frameworks e adaptar a marca sem alterar o código dos componentes. Adotar diretamente Fluent UI seria outra possibilidade, mas acrescentaria uma dependência e exigiria customização para reproduzir esta tela específica.

## Fundamentos visuais

- Fundo geral próximo de #FCFCFC; painéis e campos em branco.
- Azul de destaque próximo de #0F6CBD; ação principal com a transição azul/índigo observada na referência.
- Texto em Segoe UI com alternativas locais de sistema. Tipografia principal de 14/20 px, apoio de 12/16 px e títulos de 24/32 px, sujeitos à conferência visual.
- Espaçamento organizado em uma escala baseada em 4 px.
- Divisórias claras e sombras discretas; a maior parte da hierarquia virá do espaço, da tipografia e das bordas.
- Controles de busca e ações principais arredondados; cartões e tabela com cantos moderados.
- Navegação lateral, barra superior e conteúdo principal com alinhamentos consistentes.

Medições já confirmadas diretamente na imagem: fundo #FCFCFC, superfície #FFFFFF, divisória #F0F0F0, borda amostrada #EBEBEB e indicador ativo #0F6CBD.

A captura autenticada do REA confirmou a mesma composição da imagem enviada. Dimensões aproximadas medidas visualmente em pixels da captura: barra superior com 64 px de área reservada; navegação com 280 px de largura; conteúdo começando em x≈296; busca central com 480 px de largura e 34–36 px de altura; cartões de acesso rápido com 227 × 62 px e intervalo de 8 px; cabeçalho de tabela com 48 px; linhas com 56 px; aviso com cerca de 58 px de altura. Essas medidas serão valores iniciais de implementação, não alegações de CSS computado extraído.

Não será imposto um limite estreito de largura ao conteúdo: a tabela cresce até a margem direita, enquanto a faixa de quatro cartões conserva sua largura mais compacta.

Evidência REA da estrutura: `ev_ea369c67a6eb63ac806fcc6fde48d52f239609b19fb3bc06a67ed2e44fbc62e9`. Evidência da captura: `ev_529848a7969edc93e7719dbd9082cd1a09fe8aba4f025e64122add8c182791f9`. O REA observou 926 nós na estrutura da página. A inspeção foi limitada à origem selecionada, sem coleta de valores de armazenamento, corpos de rede ou código dos scripts.

## Componentes previstos

1. Estrutura da aplicação: barra superior, navegação lateral e área principal.
2. Item de navegação com ícone e indicação da página atual.
3. Botão principal, secundário, discreto e botão somente com ícone.
4. Campo de busca com nome acessível, estado de foco e ação de limpar.
5. Controle segmentado para alternar áreas ou visualizações.
6. Aviso informativo com ações e fechamento.
7. Cartão de acesso rápido com ícone, título e descrição.
8. Filtros de categoria com indicação de seleção.
9. Tabela de documentos com ordenação e seleção controladas pela aplicação.
10. Indicador de tipo de arquivo com texto alternativo independente da cor.
11. Avatar com alternativa em iniciais.
12. Medidor de uso de armazenamento ou outro recurso.
13. Menu de ações e estados de vazio, carregamento e indisponibilidade.

Cada componente terá variantes, exemplos e estados que façam sentido. Os componentes de dados e navegação receberão dados e ações por propriedades; não estarão ligados à conta OneDrive.

Busca, filtros, ordenação e seleção serão controlados por propriedades e callbacks. A tabela aceitará identificadores estáveis, seleção múltipla e ordenação ascendente/descendente. O menu permitirá abrir por teclado, navegar entre opções, fechar com Escape e devolver o foco ao botão de origem. Essas são decisões do kit reutilizável, não comportamento comprovado por interação com a conta.

## Demonstração

Uma demonstração local terá a composição da página inicial e um catálogo dos fundamentos e componentes. Permitirá experimentar busca, filtros, ordenação, seleção, menu e fechamento de aviso usando apenas dados fictícios.

O catálogo apresentará amostras de cor, escala tipográfica, espaçamento, raios, sombras e estados de interação. O conteúdo será em português.

## Responsividade e acessibilidade

A tela desktop fornecida será a referência de fidelidade. A adaptação para tablets e celulares será explicitamente documentada como uma proposta: navegação recolhível, busca ajustada à largura e tabela com rolagem horizontal interna quando necessária.

Usar elementos HTML semânticos, foco visível, nomes acessíveis, operação por teclado, alvos de toque adequados e respeito à preferência de movimento reduzido. Cores de texto serão verificadas para contraste; ajustes de legibilidade serão documentados quando diferirem da imagem.

## Arquivos da entrega

- `tokens.css`: variáveis primitivas e semânticas, com prefixo próprio.
- `tokens.json`: representação estruturada dos mesmos valores.
- `components.css`: estilos dos componentes, isolados por um contêiner ou prefixo.
- `react/`: componentes TypeScript, exportações e exemplo de uso.
- `demo/`: demonstração executável e catálogo visual.
- `README.md`: instalação, importação de estilos, personalização e exemplos.
- `EVIDENCE.md`: fontes, observações, limitações e decisões de adaptação.
- Pacote ZIP com os arquivos da entrega, sem o perfil de login ou dados pessoais.

O JSON será a fonte única dos tokens; um script pequeno gerará o CSS. O projeto acompanhará `package.json`, configuração TypeScript e scripts para instalar dependências, executar a demonstração e compilar a biblioteca. React será uma dependência da aplicação consumidora; os componentes não exigirão um framework de rotas ou de acesso a dados.

## Verificação

- Conferir a composição desktop com a referência e as capturas autorizadas do REA.
- Verificar que JSON e CSS compartilham os mesmos tokens.
- Compilar os componentes React e conferir suas propriedades exportadas.
- Testar busca, filtros, ordenação, seleção, menus e navegação por teclado.
- Conferir larguras desktop e mobile, ausência de transbordamento da página e contraste dos pares principais.
- Usar o REA para uma captura da demonstração, registrando claramente a diferença entre evidência da referência e evidência da implementação.

A comparação desktop usará o viewport de 1920 × 945 da captura REA e registrará as condições de renderização disponíveis. Fidelidade de composição, funcionamento dos controles e adaptação móvel terão critérios separados. A revisão de construção da proposta não encontrou bloqueadores adicionais.

## Limites e decisões deixadas à implementação

O kit não incluirá integrações de armazenamento, login Microsoft, upload real ou acesso aos documentos da conta. A inspeção da referência se limita à página inicial e à sua estrutura visual. Logotipos e ícones de produtos Microsoft não serão requisitos do kit reutilizável; serão usados símbolos próprios e substituíveis.

O implementador decidirá os nomes internos, a organização fina dos arquivos e os detalhes menores de animação. Breakpoints e comportamentos que não possam ser observados na referência serão registrados como decisões propostas, não como comportamento comprovado do OneDrive.
