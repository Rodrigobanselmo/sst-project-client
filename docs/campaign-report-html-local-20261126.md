# HTML independente do relatório — 26/11/2026

Botão Gerar HTML dentro de Configurações do relatório, separado da barra diária. Captura exclusivamente o documento selecionado em apresentação e o recorte atual do radar. Sem gestão, troca individual/comparativo, geração por IA, seleção de versões ou credenciais. Homologado pelo usuário e autorizado para publicação em 26/11/2026.

Arquivo único sem dependências de rede: estilos, gráficos SVG, logomarca PNG e ilustrações JPEG incorporados. Pipeline Next já autorizado para a logomarca pública S3 sem CORS; sem proxy genérico novo. Falhas nas imagens impedem exportação em vez de omiti-las. Imagens até 1600px; tamanho e espera de rede limitados.

Runtime fixo com hash SHA-256 na CSP, sem eval nem conteúdo interpolado em JavaScript. DOMPurify na cópia, remoção de eventos, links externos e controles; CSP default-src none e connect-src none. Sem respostas individuais extras ou estado autenticado da aplicação.

Apresentação ocupa a janela ao abrir. Fullscreen real depende de um clique por exigência do navegador; Esc sai dele. Sumário com subitens, blocos recolhíveis e anotações temporárias. Impressão retrato/paisagem prepara cópia expandida sem ferramentas nem marcas e mantém paginação.

## Validação

- Download real no localhost: HTML da SEFAZ, aproximadamente 3,4MB, 11 imagens incorporadas.
- Auditoria do arquivo real: sem recursos src/href externos, atributos de evento inline, e-mail da conta ou controles administrativos. Um runtime fixo com hash CSP válido; sintaxe JavaScript aprovada por node --check. TypeScript aprovado.
- A abertura de file: foi bloqueada pela política do navegador automatizado; não foi contornada. O usuário abriu, testou e homologou o arquivo antes de autorizar a publicação.
- Build isolado Webpack aprovado; TypeScript final sem erros após ajuste proporcional de larguras/grades para diferentes telas. Sem alterações de API, modelos, migrations ou dados salvos.

## Publicacao

- Commit funcional: 58c63aa0e24daa5027a4480ed78ca10744ba0da2.
- Build final Webpack e verificacao de TypeScript aprovados. Runtime validado por node:vm.Script.
- Referencia remota main conferida sem divergencia. Nenhuma alteracao em API, schema/migrations, workflows, configuracao de deploy ou dependencias. next-env.d.ts fora do commit.
- API anterior ae66be2e8c19de6164b9a012ec7e2dbf2e039503 confirmada com workflow 45888010916 success e migrations sem pendencias.
- Vercel Production: status success confirmado para o commit funcional: https://vercel.com/rodrigobanselmos-projects/simplesst/AsYyEtPSYBNfAWUR2YwsocKrNcgi.

## Correção local de larguras após publicação

Relato do usuário: barras saindo da moldura e rótulos estreitos no HTML independente. Causa: larguras medidas pelo getComputedStyle eram aplicadas novamente aos filhos das células, enquanto tracks fr mantinham mínimo intrínseco e SVG conservava largura da viewport original. Removida a conversão genérica de larguras HTML; percentuais inline explícitos e geometria SVG preservados, tracks com mínimo zero. Marcadores sem efeito visual no documento do sistema permitem regras próprias no HTML para rótulo, barra, valores e eixo. Colunas responsivas, SVG limitado a 100% da célula e 30px de altura; em telas pequenas a barra ocupa a linha seguinte. Larguras de spans deixam de quebrar o indicador e os ticks.

Validação: três testes de regressão aprovados, TypeScript sem erros e novo download real com 205 linhas e 41 gráficos contendo todos os marcadores e regras de exportação. Arquivo `PESQUISA DE CLIMA ORGANIZACIONAL SEFAZ-BA 2025 (4).html`. Visualização automatizada de file continua indisponível; conferência manual do HTML pelo usuário. Correção homologada e publicação autorizada pelo usuário. Commit funcional 4a5643ba485bd88778a0b49692f84c5eb87db92e; build final Webpack, TypeScript e três testes aprovados. API anterior confirmada em operação, sem alterações de migrations, configuração ou dependências. Arquivos HTML antigos precisam ser exportados novamente.

Deploy da correção: https://vercel.com/rodrigobanselmos-projects/simplesst/BcR82dpe7ESG3kM2BjhKgYXdYkMP (Vercel Production: success confirmado).
