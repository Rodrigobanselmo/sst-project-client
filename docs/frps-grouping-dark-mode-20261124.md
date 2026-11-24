# Agrupamentos FRPS: contraste no modo escuro — 24/11/2026

Escopo: tabela (cabeçalho, vazio e hover), modal manual, seletor de setores e assistente de IA incluindo resultados, categorias, propostas, evidências e confirmações. Cores fixas substituídas por tokens semânticos locais; helper texts e títulos explícitos; superfície opaca dos diálogos. Seletor de grupo empresarial usa o mesmo raio de 999px do seletor de empresa.

Não altera geração, modelo, API, dados ou regras de agrupamento. API anterior já implantada com sucesso (run 45461118215, nenhuma migration pendente). Usuário confirmou nova geração em produção concluída; nenhum agrupamento aplicado pelo agente.

Validação: TypeScript local aprovado, testes de refinamento e geração aprovados. Conferência visual local em modo escuro da tabela, modal manual e assistente inicial; largura estreita inspecionada. Resultado pós-geração conferido no código sem nova chamada paga de IA. Build completo de release aprovado com webpack e variáveis locais carregadas em memória. Turbopack não aceita o symlink de node_modules da cópia isolada; primeira coleta sem ambiente falhou e foi resolvida carregando o ambiente, sem alteração de configuração operacional. Commit funcional f1e84833b0c0d5f33dc1b5eae79aa404bd652cf9; deploy Vercel 8037891274 concluído com sucesso em Production.
