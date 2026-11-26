# FRPS — gestão manual e inventário em lote — 25/11/2026

## Entrega

Organização por setor e por fator com inclusão/remoção de riscos em lote, níveis, prévia e retomada das etapas pendentes. Remoção retira risco e dependências de fontes/recomendações, respeitando bloqueios do plano. Fontes e recomendações possuem inclusão manual e troca por catálogo. Fontes exibem apenas vínculo direto ao fator, do catálogo oficial ou da empresa. Seleções manuais são identificadas por origem, sem poluir nomes do catálogo.

Fontes/recomendações ficam dentro do setor/fator, com subníveis adicionados pela IA e pelo usuário somente quando houver itens. Seções vazias e botões + também estão disponíveis antes da geração IA. Manual não chama IA nem aplica automaticamente no inventário. Nomes de setores inteiramente protegidos no filtro atual são atenuados na organização por setor, com cores para temas claro/escuro. Expansão continua disponível. Recuos, espaçamento, contraste e preparação de lotes foram ajustados para navegação.

## Validação

Build Next de produção e TypeScript aprovados em checkout isolado do commit funcional, sem interromper o Next local. Oito testes client e 88 testes API aprovados. Conferência local das duas visualizações, seleção de catálogo, setores moderados sem IA e nomes de setores protegidos. Nenhuma nova geração IA, leitura nominal ou alteração do inventário de produção foi realizada para validar a publicação.

## Publicação

API funcional bb78799990cc4cd8ff5d2950969819065c4de039 publicada primeiro: Actions https://github.com/Rodrigobanselmo/sst-project-api/actions/runs/45736618307 com success; nenhuma migration pendente; API/worker online. Sem novas migrations, alteração de schema, dependências ou configuração operacional.

Client funcional 23dede1a4dc8a3ea9a37c4cac0a4619bda41198a publicado em main após confirmação da API. Vercel success: https://vercel.com/rodrigobanselmos-projects/simplesst/A4fcJZXrF5py23dPXiQucWJRWubS. GitHub deployment 8074156574 confirmado em Production, status success. URL da implantação: https://simplesst-ae6uamva4-rodrigobanselmos-projects.vercel.app.

Documentação separada do commit funcional. next-env.d.ts, alteração independente do radar de indicadores e arquivos de outras frentes preservados fora da publicação. A sanitização geral do banco/catálogo fica para etapa posterior.
