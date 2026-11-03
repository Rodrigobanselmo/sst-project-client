# 3.0 — Regressão web com navegador e banco reais

Esta suíte valida os fluxos existentes do web e a reformulação da etapa 5: cadastro operacional como origem única, decisão no salvar, consulta de períodos, GSE independente e data inicial de envio configurável. O teste usa Chromium (Playwright 1.64.1), Next real, AppModule da API, autenticação, permissões, Prisma e PostgreSQL reais. As telas normais alimentam o histórico automaticamente na mesma transação; a escrita manual em uma central foi removida. Os comandos internos também têm testes próprios na API (`yarn test:e2e:history:commands`). O mobile não faz parte desta suíte.

## Rodar localmente

Requisitos: Node 22, Yarn 1, Docker em execução e os checkouts `sst-project-client` e `sst-project-api` lado a lado, com as alterações de suporte aos testes na API. Instalar as dependências nos dois repositórios; depois, no web:

```sh
yarn install --frozen-lockfile
yarn test:e2e:install
yarn type-check:e2e
yarn test:e2e:web
```

Em Linux, pode ser necessário `yarn playwright install --with-deps chromium`. Se a API estiver em outro diretório, definir `E2E_API_ROOT=/caminho/absoluto/sst-project-api` ao executar. Isso indica um checkout de código; não é uma URL de servidor. Nenhuma variável nova é necessária para a aplicação ou para o deploy.

O comando cria um container PostgreSQL 17.4 com nome e porta aleatórios, aplica todas as migrations do checkout da API, gera o Prisma Client, compila a API e aplica seed sintético. Inicia a API e o Next em portas locais livres; executa os cenários do checkout com um worker e sem tentativas automáticas. Remove o container e a cópia temporária do front ao terminar, inclusive em falha ou interrupção. Para desenvolver um cenário isolado, usar `E2E_BROWSER_GREP='07' yarn test:e2e:web`; ele continua criando todo o ambiente descartável.

O front roda em modo de desenvolvimento com webpack em uma cópia isolada do código, sem `.env*`, `.git` ou `.next` do desenvolvedor, reutilizando somente `node_modules`. O backend usa `NODE_ENV=production`, inclusive para exercer a verificação real de senha. O harness configura os pipes/filtros e CORS para a origem local exata. Nenhum guard, serviço de negócio, repositório ou resposta da API é simulado. As integrações externas são desativadas na borda do harness; sockets externos da API são proibidos e o navegador só acessa as duas origens locais. O login usa a dispensa de CAPTCHA já existente para `localhost`; não cobre CAPTCHA nem login Google.

Antes de iniciar o Playwright, o setup prepara as 16 famílias de páginas usadas pela suíte: faz GET sem cookies da rota real e do bundle JavaScript completo, sem seguir o redirecionamento do guard de autenticação. A compilação tem prazo próprio (até 90 segundos por request, 5 minutos no total), falha indicando a página e grava `browser/compilation-readiness.json`. Somente a configuração da cópia descartável retém essas páginas por uma hora, evitando que a regra normal de desenvolvimento (60 segundos e 5 páginas) descarte o preparo no meio da suíte. Isso não autentica o navegador, não altera dados e não aumenta o timeout das ações ou das verificações. Ao adicionar uma família de rota à suíte, incluir sua rota e padrão em `test/e2e/compilation-readiness.cjs`. O helper tem testes puros em `node --test test/e2e/compilation-readiness.test.cjs`, que não iniciam Next, API ou banco.

O painel existente também apresenta os prazos devolvidos pela API, sem pedir novas informações nem calcular regras no navegador. Somente um resultado exato `CALCULATED` exibe vencimento; conferência pendente não presume datas. Produção restrita fica identificada como simulação, CAT com urgência preserva a indicação de ação imediata, aceite não certifica pontualidade e exclusão não renova o prazo do evento original. Os três cenários de conclusão (estrutura, eventos e consultoria) conferem essas projeções reais e sua apresentação. A regra legal, o calendário e as mensagens de conferência ficam disponíveis em um detalhe recolhível; sua apresentação não confirma ou transmite eventos.

## O que os testes comprovam

| Cenário                         | Evidência exigida                                                                                                                                                                                                                                                                |
| ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Acesso e autenticação           | Página protegida exige login; senha incorreta recebe 400 e não cria cookie; credenciais corretas recebem token e abrem a lista.                                                                                                                                                  |
| Funcionário                     | Campos obrigatórios impedem gravação; formulário cria via HTTP; edição persiste nome/telefone; recarga e reabertura mantêm os valores.                                                                                                                                           |
| CPF duplicado                   | API retorna 409; formulário conserva o preenchimento; contagem no PostgreSQL não aumenta.                                                                                                                                                                                        |
| Fator de risco                  | Severidade é obrigatória; criação persiste tipo/severidade; edição e recarga conservam os novos valores.                                                                                                                                                                         |
| Organograma                     | Cargo criado no setor correto; alteração conserva descrição, parentesco e estabelecimento após recarga.                                                                                                                                                                          |
| Lotação                         | Transferência pela interface conserva a admissão anterior, registra a nova movimentação, atualiza o cargo atual e sinaliza `EmployeePPPHistory.sendEvent`. A recarga mantém o histórico.                                                                                         |
| Riscos e vínculos               | Cadastro QUI/FIS/BIO; unidade/limite químico; criação de GSE, vínculo direto de cargo e troca para cobertura do setor; associação dos três riscos; medição química, recarga e edição com conferência no PostgreSQL.                                                              |
| Preparação S-2240               | A tela existente chama a API real no ambiente de testes por padrão, apresenta impedimentos, restaura a consulta após recarga e não oferece confirmação de preparação impedida ou transmissão desabilitada.                                                                       |
| Alteração depois de aceitação   | Um S-2240 inicial passa pela preparação, assinatura e worker com retorno governamental sintético. A medição é editada na caracterização; a decisão de nova condição é obrigatória e preserva o período anterior. O painel prepara o evento novo com a medição e data escolhidas. |
| Avaliação biológica qualitativa | A seção da própria avaliação começa com respostas não informadas; ausência sem justificativa não grava; o responsável informa presença, avaliação qualitativa e ausência de EPI/EPC, sem cadastrar medição. O primeiro S-2240 é preparado com `tpAval=2`.                        |

Cada cenário captura exceções não tratadas do navegador e respostas 401/403/5xx inesperadas da API. As asserções de banco são feitas por outro cliente Prisma, conectado exclusivamente ao banco descartável. A preparação de cenários complexos cria referências sintéticas; a operação que está sob teste é sempre realizada pela interface.

O operador sintético é administrador explícito (`master-crud`), pois a página da empresa carrega resumos de múltiplos módulos. Casos de recusa, isolamento por empresa e revogação são testados com usuários distintos nas suítes HTTP da API. O cenário 07 semeia somente a referência organizacional; cadastros, vínculos e medição sob teste são feitos pela interface.

O cenário de navegador confere os cadastros atuais e sua persistência. As telas existentes já alimentam o histórico de origem. A preservação imutável e a herança histórica também têm testes próprios de API: os comandos cruzam QUI/FIS/BIO com cargo/setor/GSE, além de BIO qualitativo.

A asserção sobre a marcação de PPP não comprova execução de um worker ou aceitação pelo eSocial. A fila pg-boss tem suíte própria na API (`yarn test:e2e:queue`). O cenário de alteração pós-envio usa um adaptador exclusivo do harness de navegador (`test/esocial/browser-controller.fixture.ts` na API), autenticado e autorizado pelos serviços reais: prepara, confirma e executa o worker S-2240 contra respostas SOAP sintéticas e um certificado sintético. Ele restaura a configuração de transmissão ao terminar e nunca integra o `AppModule` de produção. Não há chamada ao eSocial, S3, email ou serviço de IA.

## Vídeos e diagnóstico

O terminal informa o diretório único de evidências dentro da API:

```text
sst-project-api/.diag-tmp/api-e2e/simplesst-api-e2e-<id>/
  migrations.log
  build.log
  browser/
    next.log
    fixture.json
    results.json
    results.xml
    report/index.html
    results/<cenario>/video.webm
    results/<cenario>/trace.zip
    results/<cenario>/test-finished-1.png
```

Vídeos são gravados inclusive quando o cenário passa, em 1440×1000. O relatório HTML contém etapas, duração, vídeo, screenshot, trace e os métodos/caminhos/status das chamadas reais à API (sem payloads ou tokens nesse anexo). Para abrir as evidências:

```sh
yarn playwright show-report /caminho/absoluto/browser/report
yarn playwright show-trace /caminho/absoluto/trace.zip
```

Evidências ficam ignoradas pelo Git. Não enviar `.env`, dumps, credenciais ou vídeos de uma base real junto dos resultados. Os vídeos desta suíte contêm apenas os dados sintéticos. Se `ffmpeg` estiver instalado, o runner exporta automaticamente os vídeos para MP4 e os reúne em `browser/3.0/00-execucao-completa.mp4`, sem cortar o conteúdo. Os MP4 individuais e o índice HTML com prints e vídeos ficam na mesma pasta: `browser/3.0/index.html`. Sem `ffmpeg`, os WebM originais continuam disponíveis; é possível exportar depois com `yarn test:e2e:export /caminho/absoluto/browser`. O registro da execução aprovada fica na documentação de arquitetura da API.

## Problemas encontrados na execução inicial

- A tela de funcionários passava `companeId` ao modal, em vez de `companyId`: a empresa aparecia escolhida, mas o formulário bloqueava o salvamento. Corrigido; os testes de criação e duplicidade exercitam o caminho.
- O select com rótulo acima do campo não ligava esse texto ao nome acessível. O vínculo `aria-labelledby` existente agora aponta para o rótulo; o teste de lotação localiza os selects pelo nome.
- A consulta paginada de riscos podia executar com empresa indefinida durante a inicialização. Agora aguarda uma empresa válida; a suíte falha se houver 403 inesperado.
- A ampliação dos cenários revelou a mesma antecipação nas consultas de GSE e exames por hierarquia. Elas também passaram a aguardar o identificador efetivo da empresa antes de consultar.
- A regressão da tela eSocial revelou uma corrida no retorno do login: o hook de redirecionamento usava `basePath` vazio e alterava a query compartilhada. Agora usa o caminho real, uma cópia da query e processa cada redirecionamento uma vez enquanto a navegação está em andamento. O cenário protegido continua fazendo login pela interface.

São problemas identificados no código web existente, independentes da migration aditiva de histórico. Os testes registram uma regressão representativa; não demonstram funcionamento de todas as telas, todos os navegadores, geração documental, integrações externas ou aplicativo offline.

Referências da ferramenta: [gravação de vídeos](https://playwright.dev/docs/videos), [assertions](https://playwright.dev/docs/test-assertions).

## Registro histórico do fluxo operacional da etapa 5

Execução anterior: 10/10 cenários passaram em 21/10/2026, com 415 migrations e dados sintéticos. Artefatos no checkout da API: `.diag-tmp/api-e2e/simplesst-api-e2e-abfd1ade771f/browser/`; galeria de prints e vídeos: `.diag-tmp/esocial-stage-5-operational-evidence/index.html`. Naquela execução, o marcador de proteção era uma fixture explícita, sem recibo governamental; a suíte atual exige uma aceitação criada pelo worker real com respostas SOAP sintéticas. Não rodar duas suítes de API/browser no mesmo checkout: elas compartilham o build da API e o cliente Prisma; o runner impede sobreposição.

## Uso das telas atuais

O eSocial continua na página da empresa: data inicial de envio, seleção dos empregados, preparação, conferência do XML e acompanhamento do resultado. A transmissão começa em produção restrita por padrão e permanece bloqueada quando as chaves de habilitação do servidor estão desativadas. A preparação não é um recibo. Não há tabela de adoção nem outro cadastro de períodos na página do eSocial.

Na própria avaliação de risco, a seção recolhida “Condições para o eSocial” permite informar exposição, enquadramento, avaliação qualitativa ou quantitativa e utilização de EPI/EPC, além das informações complementares aplicáveis. Respostas desconhecidas permanecem “Não informado”; o formulário não transforma ausência de cadastro em resposta “Não”. Avaliação biológica qualitativa funciona sem lançar uma medição quantitativa. A edição de medições conserva as demais informações e respostas individuais de EPI existentes.

O empregado ainda sem envio usa o cadastro normal, inclusive quando colegas da mesma empresa já têm recibos. Quando o dado alterado afeta uma condição declarada, a API exige a decisão no próprio salvamento: correção do período ou nova condição com data. O teste pós-envio comprova o valor anterior no banco enquanto a decisão está aberta e os dois períodos após a confirmação.

## Verificação de 23/10/2026 — S-2240 na tela existente

Foram validados 14 cenários únicos, combinando duas execuções com PostgreSQL novo e 419 migrations em cada uma:

- Rodada geral `0978160878e6`: 13/14 aprovados; BIO interrompido ainda na preparação da referência organizacional, pois a chamada de teste não incluía `employeesIds: []`, exigido pelo DTO de hierarquia.
- Rodada direcionada final `7d99d16c97ba`: 4/4 aprovados; repetiu os dois casos do painel e a mudança de medição pós-aceitação e concluiu o cenário BIO. O painel também conferiu que buscar um empregado inexistente mantém o campo disponível para limpar a busca.

A galeria `.diag-tmp/esocial-post-send-evidence/index.html` no checkout da API reúne a última evidência aprovada de cada cenário e identifica ambas as execuções. O vídeo `00-cenarios-validados.mp4` concatena os 14 cenários aprovados, sem cortes dentro de cada cenário. Os relatórios brutos, inclusive falhas anteriores de montagem/seletores, continuam nos diretórios de execução. Não houve uma única rodada geral 14/14 nesta validação.

O BIO confirmou na interface respostas inicialmente não informadas, ausência sem justificativa recusada, salvamento de avaliação qualitativa sem medição e primeiro XML preparado com `tpAval=2`. A montagem de GSE, risco, setor, cargo, empregado, admissão e vínculo empregado–GSE desse cenário usa as rotas reais autenticadas, mesmo depois de um colega já ter recibo. O teste pós-envio confirma que a alteração ainda não foi gravada enquanto a decisão está aberta, preserva os períodos anterior/novo e conserva as respostas declarativas ao editar a medição.

Também passaram `type-check`, `type-check:e2e`, os 11 testes de `test:unit:sst`, lint dos arquivos alterados e `git diff --check`. Não há transmissão ao governo: a aceitação usada para exercer a proteção vem do worker real com certificado e retorno SOAP sintéticos, exclusivamente no harness descartável.

## Seleção de cargos e revisão de ausência

A seleção de cargos da caracterização salva inclusões e retiradas juntas, pelo endpoint `hierarchy-selection`. A retirada de um vínculo já declarado exige nova condição com data; o vínculo anterior é encerrado, preservando suas datas e os riscos cadastrados. Cancelamento ou alteração concorrente mantém as escolhas locais para conferência. A seleção não salva nome, resumo ou outros rascunhos do editor.

Retirar o último vínculo de risco de um empregado **não comprova ausência de exposição**. Sem revisão explícita dessa ausência, a preparação para esse empregado fica bloqueada por `ABSENCE_NOT_EXPLICITLY_REVIEWED`; o sistema não inventa o código `09.01.001`. Isso não impede preparar separadamente o empregado do cargo de destino, cujo vínculo e risco estão completos. O cenário `SST vínculos` verifica os dois resultados sem modificar a regra do compositor nem inserir uma declaração de ausência artificial na base.

## Perfis e ambiente após a integração de 02/11/2026

O usuário comum prepara produção e não vê os seletores de ambiente. `sst-declarations.e2e.ts` confere esse comportamento; `QA ambientes` compara explicitamente cliente e master. As jornadas complexas que precisam selecionar/acompanhar produção restrita usam atores sintéticos com papel master, sem alterar os perfis da aplicação. Os leitores continuam sem permissão CRUD de transmissão. A fronteira governamental permanece sintética, inclusive quando a interface mostra produção.
