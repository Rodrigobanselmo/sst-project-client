# FRPS — acompanhamento de geração longa — 24/11/2026

## Incidente e evidências

Usuário relatou em produção mensagem que atribuía genericamente o erro à conexão, no modo COMPARE. Consulta somente leitura ao CloudWatch, restrita à rota hierarchy-groups, encontrou GET context em 2026-11-24T17:50:46.840Z e POST propose concluído em 2026-11-24T17:55:53.330Z, HTTP 201, resposta aproximada de 179784 bytes. Nenhum payload, credencial, identidade ou resposta ocupacional foi extraído. A resposta bem-sucedida no servidor não chegou a ser apresentada na tela. A mensagem anterior era fallback genérico, não diagnóstico de falha da internet. Não foi comprovado qual intermediário interrompeu a espera; a duração observada e o contrato síncrono longo são compatíveis com timeout no caminho HTTP.

## Correção

POST generation responde 202 com acompanhamento por usuário/campanha. GET generation retorna andamento, conclusão ou falha. O serviço mantém a geração em segundo plano, deduplica inícios concorrentes do mesmo usuário e conserva o resultado por 30 minutos na memória do processo. A autorização original, validação integral, isolamento de escopo, modelo gpt-6.1-sol, limites do provedor e ausência de fallback permanecem. Falhas não expõem payload do provedor.

Cliente consulta em requisições de até 15 segundos, a cada três segundos durante o processamento. Permite fechar/reabrir, retomar após remontagem e recuperar o resultado sem nova chamada à IA. Uma resposta de início perdida causa consulta do estado, não novo POST automático. Mensagem de comunicação não afirma falha da internet. Reinício do processo continua podendo perder o acompanhamento em memória; não se trata de fila durável. Não há alteração de banco, migrations ou configuração de proxy.

## Verificação

60 testes da API aprovados; teste da interface cobre início rápido, status, fechar/reabrir e remontagem sem nova chamada à IA. Teste de refinamento mantido. TypeScript e builds de produção API/cliente executados. Não foram criados agrupamentos de produção nem solicitadas novas análises reais ao provedor durante a investigação.

## Publicação

API: fd45c050c88cd384abd1d546baa8408023a80faa. Actions: https://github.com/Rodrigobanselmo/sst-project-api/actions/runs/45455500617 — sucesso; 475 migrations, nenhuma pendente, API e worker online.
Cliente funcional: 3d24b5c71de7c5d8c50db1063e26777d74315b89. Build final aprovado; deploy Vercel concluído com sucesso, ambiente Production, ID 8036712860.
https://vercel.com/rodrigobanselmos-projects/simplesst/78Rk21jMwtcgYreiAEMTVd1htYpp
