# Validação da entrega

Data: 23 de outubro de 2026.

## Compilação e testes automatizados

- `npm run build`: aprovado. Tokens gerados, TypeScript sem erros, biblioteca ESM, declarações, demonstração para HTTP e HTML independente produzidos.
- `npm test`: 12 testes aprovados, nenhuma falha.
- Testes de dados: busca tolerante a acentos e espaços, composição entre busca e tipos, ordenação estável sem mutação da entrada, seleção limitada aos itens visíveis e resultados vazios.
- Regressões de distribuição: gerador executado numa pasta com espaços e acentos; declarações verificadas por TypeScript com resolução NodeNext.
- Importação do pacote ESM compilado e renderização no servidor: aprovadas.
- Os 71 tokens JSON correspondem aos 71 valores do CSS gerado.

Os dois testes de distribuição foram observados falhando antes das correções e passando depois. O problema do drawer também foi reproduzido no navegador antes da correção e verificado novamente depois.

## Demonstração final

O arquivo `DEMO.html` compilado foi servido por um servidor estático, separado do ambiente de desenvolvimento. As 13 verificações de interface da rodada original passaram:

1. Sete arquivos fictícios na carga inicial.
2. Busca por `revisao` encontra o item com `Revisão`.
3. Filtros de tipo e busca funcionam em conjunto.
4. Seleção múltipla dos sete itens visíveis.
5. Menu fecha com Escape.
6. Foco retorna ao botão de abertura do menu.
7. Fechamento do aviso informativo.
8. Ordenação por nome.
9. Página mobile de 390 px sem transbordamento horizontal.
10. Drawer deixa de ser modal ao ampliar de mobile para desktop, com foco em controle visível.
11. Catálogo abre corretamente.
12. Catálogo mobile sem transbordamento horizontal.
13. Troca da cor principal para verde.

Não foram registrados avisos ou erros no console durante essa rodada. A tabela usa rolagem horizontal interna em mobile; isso é intencional.

## REA e comparação visual

- Referência autenticada: captura com viewport 1920 × 945.
- Implementação desktop: captura com mesmo viewport, sem erro de página.
- Catálogo: captura 1440 × 1000.
- Implementação mobile: captura 390 × 844, cenário completo, sem erro de página.
- O cenário mobile do HTML independente registrou apenas a requisição do próprio documento, sem recursos externos.
- Os cenários REA que lançaram Chrome temporário informaram encerramento dos processos próprios ao concluir.

Evidência mobile do HTML independente: `ev_3fc257c205c9ad0fbe2ae457a0a319f42c390021f035e2e3f56a2eecd8f82200`.
Evidência do catálogo: `ev_64f0ebaf713d0e8aa83624cf43e74d4c36d0b40e2eafdb636f69463cdb985115`.
Outras evidências e as limitações da inspeção estão em `EVIDENCE.md`.

## Contraste dos pares principais

| Texto / fundo | Contraste |
|---|---:|
| Texto principal / branco | 15,52:1 |
| Texto secundário / branco | 6,79:1 |
| Texto principal / fundo geral | 15,13:1 |
| Azul da marca / branco | 5,38:1 |
| Branco / azul da marca | 5,38:1 |
| Branco / índigo | 8,11:1 |
| Texto principal / seleção | 13,69:1 |

Todos esses pares ultrapassam 4,5:1. Essa verificação não equivale a uma auditoria completa WCAG ou a testes com todos os leitores de tela. Temas personalizados precisam de nova avaliação.

## Revisão independente

A revisão encontrou e foram corrigidos três problemas: caminhos com espaços/acentos no gerador, imports das declarações ESM e permanência do drawer modal após ampliar a janela. Não ficaram achados materiais pendentes.

## Limites

Fidelidade validada por comparação visual e medidas aproximadas da captura, não por extração integral do CSS original. O mobile, o catálogo e os estados não observados no OneDrive são adaptações do kit. Os arquivos e as pessoas da demonstração são fictícios; o pacote não contém o perfil de login nem capturas privadas da conta.


## Extensão de temas — versão 1.1.0

- Cinco testes adicionais verificam preferência persistida, modo inicial escuro, mudanças do sistema, override explícito, inscrição/cancelamento de observadores e armazenamento indisponível.
- No navegador: Claro e Sistema selecionáveis; Escuro preservado após recarregar; seletores do catálogo e diálogo sincronizados; diálogo fecha por Escape; controle acessível em mobile sem overflow.
- O foco da busca em Escuro + Violeta foi reproduzido com contraste insuficiente, corrigido para o token de foco e verificado no estilo computado: `rgb(139, 197, 255)`.
- REA em ambiente com sistema escuro confirmou `theme=dark`, `mode=system`, sem erros: `ev_6369adef9aa7bc9c956e284483468a3343d0ea5132f5ff0358b6b4d97d0e8c3a`.
- REA confirmou que escolher Claro prevalece sobre o sistema escuro: `theme=light`, `mode=light`, sem erros: `ev_722f4859f7adad7df67cc3da5b2e7973e7d5e9d7c4724994785ca1f0d17f6af7`.
- Sete pares principais de texto foram calculados em cada modo: todos superam 4,5:1. No escuro: texto/superfície 15,12:1, texto secundário/superfície 9,75:1, links/superfície 7,67:1, branco/azul 5,38:1, branco/índigo 8,11:1, texto/seleção 10,85:1.
- Biblioteca ESM e snapshot SSR do provider/seletor conferidos na revisão independente; nenhum achado material pendente após a correção do foco.

O tema escuro é uma adaptação própria, validada nos componentes do kit. As capturas históricas claras permanecem como referência; `images/workspace-dark.png` mostra a extensão.
