# Navegação e cards da Home — 24/11/2026

Pacote visual homologado pelo usuário e autorizado para publicação.

- Abas do primeiro nível com formato de navegador e efeito de vidro nos temas claro e escuro. Sub-abas mantêm o estilo anterior.
- Cards da Home com vidro; intensidade levemente reduzida apenas nos cards do tema claro. Espaço de 20 px abaixo da navegação.
- Cards e cabeçalho com nome da empresa e detalhes restritos à Home / Dados da Empresa. Demais telas preservam a navegação contextual.
- Cards expandidos por padrão quando não existe preferência; persistência da última escolha do usuário preservada.
- Contraste da seleção Lista / Mapa de Presença / Dados Técnicos corrigido.

Validação: TypeScript e build completo de produção com webpack aprovados; teste de persistência useCompanyWorkspaceCardsCollapsed.util.spec.ts aprovado. Conferência visual local e homologação do usuário nos dois temas.

Commit funcional: 45ced704453fcc02b29223a340070f4cbd59acba. Seis arquivos funcionais isolados. Sem alteração de API, migrations, modelos de IA ou configurações operacionais. next-env.d.ts excluído; alterações locais alheias preservadas.

Deploy Vercel 8044552435 concluído com sucesso em Production.
