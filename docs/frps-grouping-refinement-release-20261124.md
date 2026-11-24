# Agrupamentos FRPS — refinamento e hierarquia — 24/11/2026

Publicação autorizada pelo usuário após teste real: inclusão de CALL CENTER na proposta Comercialização de grupos e eventos, atualização para três setores e cinco respondentes e criação do agrupamento com a composição ajustada.

## Escopo homologado

- Caminho organizacional dinâmico completo, sem presumir que diretoria e gerência existam em todas as empresas; fornecido também como contexto à IA.
- Cadastro manual com filtros combináveis, ordenação, opção razão social/nome fantasia (fallback para razão social), ocultação independente de empresa/estabelecimento e identificação dos níveis por tooltip.
- Nome do nível principal em negrito nas opções de filtro. Inclusão de setor exibe nome em negrito e quantidade de participantes entre parênteses, com peso normal.
- Edição diretamente na proposta: incluir, retirar e confirmar a transferência de setor de outra proposta. Preservados categoria, escopo empresarial, mínimo de dois setores e ausência de duplicação.
- Preview no servidor recalcula contagens sem chamar IA. Apply revalida o original e os ajustes e exige nova confirmação da composição modificada.
- DTO aninhado explícito corrige conversão dos objetos de ajuste em arrays vazios pelo ValidationPipe com enableImplicitConversion.
- Falha de ajuste aparece junto à proposta e bloqueia criação até nova tentativa ou escolha explícita da composição anterior.
- Exemplo de contexto neutro, aplicável a diferentes atividades empresariais.

## Validação

API: build completo e 56 testes em quatro suítes, incluindo passagem real pelo ValidationPipe, preservação dos ajustes e transferência sem duplicação.
Cliente: build de produção webpack, quatro testes do modelo de seleção e teste de integração da interface com preview/apply, reconfirmação e bloqueio após falha. Verificações visuais em desktop e largura de 390px durante implementação; homologação real final pelo usuário.

Não há mudança de schema, migrations, dependências, workflows ou configurações operacionais. Último deploy anterior da API: Actions 45426989802, commit 37e7bb25bc7ae90d4f20a1e8364e0d0fe275ddf5, concluído com 475 migrations e nenhuma pendência.

Modelo de análise permanece explicitamente gpt-6.1-sol, sem alteração de adaptador nem fallback. Nenhuma nova geração real solicitada pelo agente para publicar; adotada a homologação do usuário.

## Publicação

API funcional: 09735e65708308cba32445f7c594fe846b9f078c.
Deploy API: https://github.com/Rodrigobanselmo/sst-project-api/actions/runs/45451118023 — sucesso, 475 migrations encontradas e nenhuma pendente; API e worker online.
Cliente funcional: 54bffa2fb49fd21dbf76cf3117bbbf46cca1903f.
Vercel: https://vercel.com/rodrigobanselmos-projects/simplesst/651nxqvuNF5TKzaRQ1yqBMGuPZxs — sucesso, ambiente Production, deployment 8036082839.
URL do deployment: https://simplesst-c8ozf6s8c-rodrigobanselmos-projects.vercel.app
