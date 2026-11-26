# Configurações recolhíveis do relatório — 26/11/2026

- Área “Configurações do relatório”, com ícone, explicação, seta e componente SAccordion no padrão de navegação dos outros painéis. Inicialmente recolhida.
- Reúne modos apresentação/técnico, documento individual/comparativo, geração de análise/ilustrações, versões, status, avisos, sumário e PDF retrato/paisagem.
- Seletores e geração da comparação são apresentados no mesmo painel via portal React, preservando o estado do componente do documento e excluindo esses controles da cópia impressa.
- Documento permanece montado e visível fora do acordeão; painel recolhido não recolhe o relatório. Removida a classe polished-form-panel na aba Relatórios e simplificado o wrapper externo, sem borda/sombra/padding adicional. Cartões internos do documento preservados.
- Saída de tela cheia mantém acesso independente do painel de configurações.
- Validação: TypeScript sem erros; conferência no navegador de abertura/recolhimento, documento visível, controles ocultos após a animação, modo técnico/apresentação, comparação e seleção de ciclos, teclado Enter, temas claro/escuro e viewport 390px. Estado final: apresentação, tema escuro, configurações recolhidas e relatório individual visível.
- Nenhuma geração por IA ou alteração dos dados/relatórios salvos. Implementação local, sem publicação nesta etapa.

## Ajuste da barra próxima ao documento

Seleção “Relatório da campanha / Evolução entre campanhas” e exportação PDF retiradas do interior das configurações e posicionadas imediatamente antes do documento, acessíveis também com configurações recolhidas. Seleção à esquerda e PDF retrato/paisagem à direita na mesma linha em desktop; disposição em coluna em largura estreita. Conferência DOM confirmou a mesma coordenada vertical para os quatro botões; troca imediata entre os documentos verificada no navegador. TypeScript sem erros.

Modos Apresentação (HTML), Relatório técnico e Tela cheia movidos para o centro da barra junto ao documento, entre seleção individual/comparativa e exportação PDF. Mantidos acessíveis com configurações recolhidas. Alinhamento desktop conferido no DOM; TypeScript aprovado. Descrição do painel atualizada para refletir somente versões/geração.

Barra padronizada com títulos Tipo de relatório, Forma de apresentação e Exportação em PDF, usando o mesmo componente visual de título/orientação. Instrução “Salvar como PDF” movida para cima dos botões. Conferência visual e DOM aprovadas, incluindo mesma coordenada vertical dos grupos de botões; TypeScript sem erros.

## Sumário flutuante

Botão discreto Sumário fixo no rodapé central, independente das configurações. Abre painel vertical por hover, foco ou clique; fecha com saída do mouse, foco externo, clique externo, Esc, botão de fechamento ou seleção. Inclui início do relatório e seções principais do documento selecionado. Navegação abre o bloco recolhido, move foco acessível e respeita preferência por movimento reduzido. Fora do article e oculto na impressão, sem interferir nos PDFs. Verificados saltos para itens 7 e 4, retorno ao início, Esc, uso em tela cheia e largura 390px (painel dentro da viewport, 16px de margem). TypeScript aprovado. Nenhuma publicação nesta etapa.

## Subitens no sumário flutuante

Títulos numerados de ReportDisclosure recebem marcador estrutural, sem alterar conteúdo. Ao abrir o sumário, lê os títulos reais do documento e monta níveis como 4 → 4.11 → 4.11.3; também contempla 3.x e 7.1. Em desktop, hover/foco revela painel lateral ancorado sem deslocar o menu; seta permite abertura por clique/teclado. Em largura estreita, clique abre dentro do painel com rolagem. Título principal continua navegável. Navegação a subitem abre disclosures ancestrais e move foco. Verificados 4.11.3 no desktop e 4.2 em 390px, destino focado, painel dentro da viewport e fechamento após navegação. TypeScript sem erros. Sem publicação.

## Anotações durante a apresentação

Botão Anotar no canto inferior direito, disponível somente em tela cheia. Painel com Navegar, caneta livre, marca-texto translúcido, borracha por traço, seis cores, espessura, desfazer e limpar. Camada SVG acompanha a rolagem do documento, com limites de traços/pontos/histórico para conter consumo de memória. Marcas temporárias em memória: são descartadas ao sair da tela cheia, trocar documento/versão/modo ou alterar dimensões do relatório; não são persistidas nem incluídas no PDF. Navegar libera os cliques no conteúdo.

Validação no navegador: desenho real com arraste, caneta vermelha, marca-texto com stroke-opacity 0.3, desfazer, apagar/restaurar traço, limpar e desmontagem ao sair da tela cheia. Camada fora do article impresso. Aparência do painel conferida; TypeScript sem erros. Implementação local, sem publicação.

Ícone da borracha substituído por desenho explícito de borracha. Mantidos tooltips de Navegar, Caneta e Marca-texto; tooltip da borracha explica clicar/arrastar sobre uma marca para apagá-la. Rótulo Cor separado em linha própria. TypeScript aprovado. Sem publicação.

Correção dos tooltips: wrapper no botão inteiro e Popper sem portal, mantendo o texto dentro do elemento em tela cheia. Seleção explícita dos botões preservada. Verificada no navegador a exibição do tooltip da borracha por foco de teclado e sua seleção; TypeScript aprovado.

## Publicação

Publicadas todas as melhorias acima em produção no commit 273b1f19dff5c0c8647a8a3305e90e7f6b7e9d57, após API ae66be2e8c19de6164b9a012ec7e2dbf2e039503 e confirmação de migrations. Vercel success: https://vercel.com/rodrigobanselmos-projects/simplesst/9cDgUTTjDFiUpSayrztqFm5v1pJp. Build Webpack e sete testes aprovados; configurações recolhidas e Sumário conferidos em produção.
