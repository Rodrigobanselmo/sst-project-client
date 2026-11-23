# Organograma: hierarquias sem estabelecimento

Homologado pelo usuário em 23/11/2026 na COMPAC Engenharia.

Registros existentes sem workspaceIds agora aparecem diretamente sob a empresa, com o rótulo “Sem estabelecimento”. O ID e o nome do cadastro são preservados; nenhum vínculo ou parentId persistido é alterado. O aviso permanece visível ao filtrar estabelecimentos. Arraste e adição de filhos são bloqueados nesses nós; ações existentes de consulta/exclusão conservam as verificações do servidor.

Escopo desta publicação: apresentação no client. Sem alterações de API, schema, migrations, dependências, workflows, configurações operacionais ou dados. As barreiras de criação/importação e a limpeza de registros não fazem parte deste commit.

Validação: teste de apresentação (registro visível, sem duplicação ou mutação dos dados, excluídos ignorados, registros regulares preservados, aviso mantido no filtro); teste existente dos filtros do organograma. Homologação visual local concluída pelo usuário. Build Next.js/Webpack com variáveis locais carregadas somente no processo, sem arquivos de ambiente no commit.
