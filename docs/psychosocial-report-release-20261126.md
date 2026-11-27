# Publicação do relatório psicossocial — 26/11/2026

## Escopo

Relatório por estabelecimento ou consolidado, proteção de anonimato, classificação pelo motor canônico e separação dos indicadores de saúde dos fatores ocupacionais. Agrupamentos incluídos na avaliação; planejamento por arraste, contagem de respondentes, filtro por mínimo configurado e consolidação pelo modal manual. Atualização das seções 7.3–7.5 após salvar, contraste no modo escuro, radar, navegação e exportações HTML/PDF.

Sem alteração de modelos de IA, schema ou migrations. Schema e migrations de ciclos comparados com o remoto, sem diferenças. Alterações de outras frentes preservadas em suas cópias de trabalho; next-env.d.ts excluído da publicação.

## Validação

- API: 22 testes aprovados e build aprovado na cópia isolada de publicação.
- Client: TypeScript e build de produção aprovados na cópia isolada de publicação; 3 testes de layout HTML aprovados.
- Usuário homologou agrupamento manual, imagem de arraste e PDF em paisagem.
- Comparação validada por fixtures. Homologação com uma segunda campanha real permanece para quando essa campanha existir.

## Produção

- API funcional: f8e0c0576116fd9c141a0d346b999d02c9056434.
- Workflow da API: https://github.com/Rodrigobanselmo/sst-project-api/actions/runs/45924675491 — success. Log confirmou 478 migrations, nenhuma pendente, API e worker online.
- Client funcional: b4e67df2fa5a05eab780d6c50f3b4cf89344b9b5.
- Vercel: https://vercel.com/rodrigobanselmos-projects/simplesst/8DiCixQHDYQD6J5w3mnFeYxJYgYu.
- Status final do client: success confirmado pelo status Vercel do commit funcional no GitHub.

Documentação mantida em commit separado do código funcional.
