# Ilustrações IA — client V1

Atualização posterior: o editor completo foi homologado na etapa de refinamento. Consulte [refinamento e homologação local](ai-illustrations-refinement-local-homologation.md) para resultados atuais, arquivos e roteiro de reprodução. As seções abaixo registram a implementação inicial.

## Git e escopo

Branch `feature/ai-characterization-illustrations-client`, criada no diretório principal após `git fetch origin main` e `git merge --ff-only origin/main`. `main` e `origin/main` estavam em `09574f23c5ac662ec89802baf28d897b21ebd35c`, sem alterações locais. Nenhum worktree criado; oito stashes e worktrees existentes preservados.

API não alterada nesta etapa. `src/main.ts` da API permanece com o mesmo diff preexistente. Nenhum commit, push, deploy, alteração de dependências, .env, configuração de deploy, migration ou geração paga.

## Interface

Botão **Gerar ilustração com IA** na área **Fotos e ilustrações** do `ModalCharacterizationContent`, depois dos cards de fotos existentes. Só monta funcionalidade para elemento existente/detalhe carregado, usuário identificado e permissão de criação OU edição de caracterização pelo mecanismo `useAuthShow` existente. A API continua sendo a autoridade de autorização.

Não foi criado novo módulo/página de produto. O componente `IllustrationsPanel` contém um Dialog simples: início, processamento, prévia autenticada, aprovação, regeneração explícita, descarte, recuperação e erros. O estado `hasUnsavedChanges` do editor existente impede gerar/regenerar e informa que o usuário precisa salvar. Não dispara salvamento automaticamente nem altera seu fluxo.

A marca obrigatória aparece na prévia, visualização e cards:

> ILUSTRAÇÃO GERADA POR IA —
> NÃO REPRESENTA REGISTRO FOTOGRÁFICO REAL.

Os cards só oferecem visualização, download e exclusão com confirmação. Não passam pelo editor/recorte/substituição de fotografias.

## Disponibilidade pela API existente

Não existe endpoint explícito de capabilities/flag. A solução compatível, implementada sem alterar a API, consulta:

`GET /v2/companies/:companyId/workspaces/:workspaceId/characterizations/:characterizationId/illustrations`

- HTTP 200: confirmação positiva da disponibilidade e autorização naquele escopo; mostra o botão e a coleção.
- 403/404: oculta o recurso. Não afirma que todo 404 significa flag desligada: pode ser rota/elemento indisponível.
- Erro de conexão/servidor: mostra aviso de verificação e permite nova consulta GET, sem habilitar geração por suposição.
- Nova consulta antes de abrir o modal confirma novamente a disponibilidade.

Listagem tem chave própria com usuário, empresa, workspace e elemento, sem retries automáticos. Aprovação/exclusão atualizam somente essa consulta. Não há invalidação global de caracterizações ou análises.

## Contratos e segurança

`illustrations.api.ts` encapsula exclusivamente os endpoints de ilustrações. Geração usa POST sem corpo com prompt/modelo e um `Idempotency-Key` UUID novo por solicitação. Status usa GET; aprovação, descarte, listagem, arquivo e exclusão seguem os endpoints existentes.

Arquivos são requisitados pelo client HTTP autenticado como blobs e exibidos por object URLs. Não se usa URL S3 nem `<img>` apontando diretamente para endpoint sem Authorization. Object URLs são revogadas na troca/desmontagem e após download. Nenhuma imagem/base64 é gravada em localStorage/sessionStorage.

`illustrations.flow.ts` é a máquina de estados usada pela interface e pelos testes. Guarda somente chave de idempotência e ID de geração em sessionStorage, separados por usuário, empresa, workspace e elemento. Falha/bloqueio do storage não derruba o fluxo; nesse caso a retomada só existe em memória. A retomada persiste em recargas da mesma aba, não é sincronização entre dispositivos.

- Sem ID após perda de resposta: não faz POST automaticamente. A ação explícita **Retomar mesma solicitação** reenvia a mesma chave; se a primeira requisição nunca chegou ao servidor, ela pode iniciar a solicitação original, conforme aviso da interface.
- Com ID: **Consultar status** faz GET, sem gerar outra imagem.
- GENERATING/APPROVING: permite consultar, sem criação de outra solicitação.
- UNKNOWN: informa incerteza e aguarda reconciliação, sem regenerar.
- READY: permite aprovação, descarte ou regeneração explícita; regenerar descarta a prévia anterior antes de criar outra chave.
- EXPIRED/FAILED/DISCARDED: permite uma nova solicitação explícita após resolução do estado anterior.
- Aprovação perdida/incerta mantém o ID para consulta ou repetição idempotente.
- 400/401/403/404/409/410/429/503 são tratados com mensagens da API ou alternativas em português, inclusive erros JSON retornados como blob.

Coleções permanecem separadas: `photos` não foi modificado, nem recebeu IDs/URLs de ilustrações. Não há mudanças em seletores de fotos de IA, catalog-only, análise operacional, GSE, PGR, inventário, planos de ação, relatórios ou exportações. A inclusão de uma ilustração não altera o snapshot de edição da caracterização.

## Arquivos

- `src/components/organisms/modals/ModalAddCharacterization/components/ModalCharacterizationContent/index.tsx`: integração no editor e permissão.
- `.../Illustrations/IllustrationsPanel.tsx`: modal, consulta separada e cards privados.
- `.../Illustrations/illustrations.api.ts`: tipos, endpoints, blobs e normalização de erros.
- `.../Illustrations/illustrations.flow.ts`: estado, idempotência, recuperação e IDs de sessão.
- `test/illustrations/flow.test.cjs`: 11 testes pontuais.
- `test/illustrations/local-harness.cjs`: harness opt-in com API real de escopo reduzido e provedores simulados.
- Este documento.

## Validação executada

1. `node --test test/illustrations/flow.test.cjs`: **11 testes aprovados**, cobrindo edição pendente, timeout sem retry, replay com mesma chave, retomada GET, isolamento da sessão, storage indisponível, limite 429, resultado UNKNOWN, aprovação incerta, regeneração, expiração e contratos sem photos/prompt/modelo.
2. Testes existentes de `characterization-editor-dirty.spec.ts`: **17 verificações aprovadas**, incluindo salvamento, alterações de texto/fotos, reversão, hidratação e snapshot.
3. Checagem TypeScript com `noEmit` restrita aos arquivos da demanda e ponto de integração: **zero diagnósticos**. `git diff --check` aprovado. Sem build completo.
4. Harness local: PostgreSQL 17.11 em `localhost:5432/postgres`, IP do container conferido `172.18.0.3`. Controller, serviço, repositório, JWT e guards reais, com OpenAI/S3 simulados. Nenhum AppModule completo, fila ou cron de produção iniciado.
5. O client HTTP e a mesma máquina de estados da UI exercitaram geração, aprovação, listagem, exclusão, resposta perdida e replay idempotente no banco real. O provedor não foi chamado de novo no replay. Chaves e dados vieram de fixtures novas, sem usar registros reais como fixtures.
6. Navegador com bundle isolado do próprio `IllustrationsPanel`: botão condicionado a permissão e elemento salvo; bloqueio por alterações pendentes; processamento; prévia marcada; aprovação e card; download; visualização; exclusão; recarga e recuperação por GET; regeneração; descarte; flag desligada escondendo o recurso; falha simulada e consulta UNKNOWN sem nova geração automática.
7. Total do provedor simulado durante os cenários de integração/browser: seis chamadas, zero chamadas reais. Bundle parcial de teste em memória, sem build Next completo e sem nova página de produto.
8. Harness encerrado; fixtures removidas por IDs exatos e fingerprints de fotos/caracterizações/empresas/workspaces/usuários confirmaram dados reais inalterados. Nenhum reset de sequência ou limpeza de outros arquivos.

Evidência visual de prévia com imagem sintética: `/tmp/simplesst-client-illustration-preview.png`.

### Repetir em ambiente autorizado

O harness usa as dependências já instaladas no repositório irmão da API, sem modificá-lo. Exige banco local na porta 5432 e migration da API já aplicada. Nunca usar banco remoto, seed ou provedor real.

```sh
SIMPLESST_ILLUSTRATIONS_LOCAL_TEST=1 node test/illustrations/local-harness.cjs
```

Com `--serve`, também produz uma URL local para conferir o componente no navegador. O servidor é temporário, usa chave JWT de teste apenas em memória, bloqueia sockets externos e encerra/limpa por sinal ou após 15 minutos. Os endpoints `/__test/*` existem somente nesse harness, fora da aplicação e do bundle de produto. Não executar duas instâncias simultâneas: os fingerprints pressupõem fixtures isoladas.

## Pendências de homologação

- Conferir o editor completo com sessão de homologação e dados de teste, tema real, responsividade e alternância de perfis. O teste visual executado montou o componente isolado com o sinal de alterações pendentes; não abriu toda a aplicação Next.
- Em uma API real com flag desligada, a funcionalidade fica oculta, como esperado. Não habilitar por .env do client: a confirmação vem da API.
- Antes de ativação real, continuam pendentes a política efetiva privada do S3 e a homologação autorizada de modelo/usage/latência. Não houve acesso externo ao S3 nem geração real.
- Não há necessidade de nova alteração da API para detectar disponibilidade nesta V1. Um endpoint explícito de capabilities pode ser evolução posterior, sem ser pré-requisito deste client.
