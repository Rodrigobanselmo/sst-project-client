# Administração de ilustrações — client, etapa 2

Branch: feature/ai-characterization-illustrations-client. Sem publicação ou chamadas pagas.

## Interface

Empresas → Ações da empresa → Ilustrações com IA. A ação e a montagem do modal exigem MASTER pelo mecanismo de acesso existente. A API verifica o MASTER efetivo e os limites. O modal é montado somente ao abrir; consultas financeiras não são disparadas com ele fechado. Cache por empresa e usuário, sem retenção após desmontagem.

Três abas:

- Configuração: nome da empresa, habilitação, limite quantitativo/período, orçamento USD/período independente; períodos Dia/Semana/Mês. Valores iniciais vêm de GET settings. Não há salvamento automático. PUT envia expectedVersion; sucesso substitui o formulário pela resposta persistida. 409 conserva o rascunho e bloqueia novo salvamento até a ação explícita Atualizar dados. Fechar com alterações pede descarte.
- Consumo e histórico: seis indicadores do contrato, reservas anteriores identificadas como subconjunto das pendentes e aviso de que custo calculado não é fatura OpenAI. Filtros de início UTC inclusivo, fim UTC exclusivo, status, solicitante e workspace. Paginação de 10 em 10.
- Alterações: auditoria paginada, antes/depois, MASTER, data UTC e versão; sem edição ou exclusão.

O portal do modal interrompe propagação de cliques para a linha da empresa, evitando navegação involuntária. Componentes reutilizados: SModal/SModalPaper/SModalHeader, STable e controles Material UI existentes no projeto.

## Permissão e editor

PermissionEnum e os mapas existentes incluem 4.62, rótulo Gerar ilustrações com IA, somente operação c. A permissão aparece no grupo Segurança. Ativar uma role não pré-seleciona essa concessão; é preciso marcar explicitamente a opção no formulário atual. Nenhum grupo é atualizado por abrir/editar a interface.

O painel consulta GET illustrations/capabilities separadamente de GET illustrations. A geração e regeneração exigem canGenerate; uma nova checagem precede a solicitação. Erros e bloqueios mostram a mensagem/motivo da API. Uma falha na consulta bloqueia geração.

Galeria, arquivos, prévias, aprovação e descarte não dependem de autorização para uma nova geração. Uma tentativa conhecida pode ser retomada quando a empresa está desabilitada. Retomar sem generationId (poderia admitir uma chamada pela chave original) exige capacidade para gerar. Aprovação usa somente a tentativa mostrada. O UUID e a máquina de estados anteriores foram preservados; não há geração automática, modelo/prompt livre ou mistura com photos.

Salvar configurações invalida consumo/histórico/auditoria da empresa e capacidades dos editores, sem invalidar fotografias ou análises técnicas. Gerar atualiza capacidades e consultas de consumo/histórico pertinentes; aprovar/excluir atualiza a galeria e capacidades.

## Contratos

Adaptador administrativo em illustration-administration.api.ts implementa GET settings, PUT settings, GET usage, GET generations e GET settings-audit na base /v2/companies/:companyId/illustration-administration.

Orçamento permanece string decimal (até 6 casas); vírgula digitada é convertida em ponto. Erros 400/403/409/429 preservam detalhes do servidor. Não há endpoint de zerar UNKNOWN nem operações de auditoria.

Referência: documento da API ai-characterization-illustrations-administration-api.md. Nenhum bloqueio de contrato ou alteração da API foi necessário.

## Arquivos desta etapa

- src/components/organisms/modals/company/IllustrationAdministration/IllustrationAdministrationModal.tsx (novo)
- src/components/organisms/modals/company/IllustrationAdministration/illustration-administration.api.ts (novo)
- src/components/organisms/tables/CompaniesTable/CompanyActionsRow.tsx
- src/project/enum/permission.enum.ts
- src/core/constants/maps/permissions.constant.map.ts
- src/core/constants/maps/roles.constant.map.ts
- src/components/organisms/modals/ModalAddUsers/components/SelectRoles/index.tsx
- src/components/organisms/modals/ModalAddCharacterization/components/Illustrations/IllustrationsPanel.tsx
- src/components/organisms/modals/ModalAddCharacterization/components/Illustrations/illustrations.api.ts
- test/illustrations/administration.test.cjs (novo)
- test/illustrations/administration-components.test.cjs (novo)
- test/illustrations/local-harness.cjs (compatibilidade com novas concessões/configuração apenas nas fixtures; modo administrativo simulado)
- Este documento.

As alterações anteriores em ModalCharacterizationContent, flow, API, src/main.ts e demais arquivos fora do escopo foram preservadas. Sem .env, dependências, migrations ou deploy modificados.

## Validação

24 testes pontuais: adaptador, formulários/eventos dos componentes com hooks/providers simulados e regressão da máquina de estados. Sem adicionar dependências de testes.

Comando: node --test test/illustrations/flow.test.cjs test/illustrations/administration.test.cjs test/illustrations/administration-components.test.cjs

Integração: SIMPLESST_ILLUSTRATIONS_LOCAL_TEST=1 node test/illustrations/local-harness.cjs. Usa controllers/services/guards e PostgreSQL local reais, OpenAI/S3 simulados. Verifica geração, aprovação, galeria, exclusão, interrupção/replay e descarte, e remove as fixtures por IDs com fingerprints dos registros anteriores.

Checagem TypeScript limitada aos arquivos alterados, sem build completo.

Conferência no navegador real localhost: ação MASTER, abertura do modal, alteração independente de período financeiro, salvamento confirmado, consumo/histórico vazio e auditoria gerada. Somente empresa fictícia. Detectada e corrigida propagação do clique para a linha da empresa.

## Homologação local

Client: porta 3000; API: porta 3330. Ambiente de conferência atual usa o harness --editor --admin com OpenAI/S3 simulados, flag somente no processo e empresa fictícia inicialmente desabilitada. Nenhuma alteração de ambiente ou API em disco.

Para recriar o ambiente com as portas livres:

NODE_ENV=development APP_HOST=localhost QUEUE_ENABLED=false SIMPLESST_ILLUSTRATIONS_LOCAL_TEST=1 SIMPLESST_LOCAL_API_PORT=3330 node test/illustrations/local-harness.cjs --editor --admin

O terminal imprime EDITOR_BROWSER_URL, empresa e usuário de teste. Abrir a URL de sessão local, pesquisar a empresa fictícia impressa e usar Ações → Ilustrações com IA. A sessão usa o login real local com cookies temporários; não muda autenticação de produção.

O harness encerra após 45 minutos e remove somente suas fixtures; também limpa ao receber SIGTERM/SIGINT. Não utilizar registros reais nesse modo. Para homologação normal posterior, iniciar a API atualizada com sua configuração local aprovada, acessar http://localhost:3000/dashboard/empresas com MASTER e manter a flag/empresa conforme autorização.

API e client não estão publicados. A aprovação funcional da administração permanece com o usuário.
