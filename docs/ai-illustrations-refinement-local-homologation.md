# Refinamento e homologação local de ilustrações — 21/10/2026

Trabalho nos diretórios principais e nas branches existentes `feature/ai-characterization-illustrations-api` e `feature/ai-characterization-illustrations-client`. Sem commit, push, deploy, migration, build completo ou chamada paga. Nenhum `.env`/configuração de deploy alterado. Diff preexistente da API em `src/main.ts` preservado (SHA-256 `a547df65719a8fb65ad413b9e5d557510ba4e93751f1c57f05036fb47ac384da`). Stashes e worktrees preservados: API 13/6, client 8/3.

## Ajustes

- Sharp aplica a mesma frase, nas mesmas duas linhas, com Liberation Sans Bold 36 (antes 25), espaçamento 12 e faixa branca exclusiva de 160 px abaixo do cenário. Arquivo final PNG 1024×1184. O cenário original 1024×1024 permanece idêntico pixel a pixel. Não há imagem sem marcação no novo fluxo.
- Prévia com limite responsivo de altura, até 480 px, para manter frase e ações visíveis na viewport local de 1280×720.
- READY: aprovação com botão principal; regeneração e descarte mantidos; sem botão Consultar status. Consulta permanece nos estados de recuperação/andamento/incerteza e expiração.
- Regeneração pede confirmação: uma nova geração consome limite e descarta a prévia anterior sem aprovação. Só após descarte confirmado solicita nova tentativa com outro UUID. Falha no descarte impede nova geração. Aprovação usa exclusivamente o ID atualmente exibido.
- Contratos de fotos, autorização e política financeira não foram alterados.

## Homologação no editor real

Foi iniciado Next em desenvolvimento (webpack, compilação de páginas sob demanda, sem `next build`) e AppModule real com provedores OpenAI e armazenamento de ilustrações simulados. JWT, guards, controllers, serviços, repositórios e PostgreSQL 17 locais reais. Flag habilitada apenas no processo temporário. Sockets externos da API bloqueados; integrações externas em modo offline; cron/intervalos de manutenção parados.

Criados empresa, unidade, usuários, elemento e fotografia sintética controlados. Não foram usados registros reais como fixtures. O login da fixture foi feito pelo endpoint real `/session`; uma ponte HTTP de teste em loopback colocou os cookies dessa sessão no navegador e redirecionou ao editor existente. Isso permitiu contornar a indisponibilidade do domínio local na chave reCAPTCHA sem alterar o código de login nem os guards do produto. A ponte existe somente no harness opt-in e não integra a aplicação.

Conferido no navegador:

1. Editor existente carregado com usuário autorizado e fotografia controlada.
2. Botão na seção Fotos e ilustrações; geração simulada e prévia marcada legível.
3. Ausência de Consultar status em READY e aprovação visualmente destacada.
4. Recuperação de tentativa por GET após recarregamento do componente, sem nova geração.
5. Aviso de regeneração, descarte anterior e aprovação da tentativa nova.
6. Card próprio na galeria junto da fotografia preservada.
7. Download concluído e visualização ampliada; arquivo baixado conferido com dimensões 1024×1184 e faixa legível.
8. Exclusão da ilustração; fotografia e suas ações próprias mantidas.
9. Flag desligada por endpoint exclusivo do harness: GET devolveu 404 e botão desapareceu no editor após recarga.

Verificação HTTP complementar enquanto existia ilustração aprovada: detalhe legado da caracterização retornou uma única entrada em `photos`, a fotografia controlada; nenhum ID/URL de ilustração estava nesse array. Repetição da aprovação retornou o mesmo ID. Seletores/análises técnicas continuam usando exclusivamente `photos`; nenhuma análise de IA foi disparada. Três chamadas ao gerador simulado nesta execução, zero geração real.

Ao encerrar, fixtures removidas e fingerprints confrontados com o baseline original: fotos 6338, caracterizações 1983, empresas 391, workspaces 397, usuários 140, todos idênticos. Servidores temporários encerrados. O `next-env.d.ts` atualizado automaticamente pelo Next dev foi restituído ao conteúdo anterior.

Durante a preparação, uma fixture com endereço longo `.invalid` travou o validador legado de e-mail. O processo foi interrompido e suas fixtures removidas por UUIDs exatos. A execução seguinte começou antes da conclusão dessa limpeza, portanto seu baseline intermediário incluía a fixture anterior e a comparação interna final acusou diferença. A verificação independente contra o baseline original confirmou a integridade e a remoção de todas as fixtures. O harness usa agora e-mail curto do domínio reservado `example.com`, compatível com esse validador. O regex legado permanece fora do escopo e merece correção separada.

## Repetir manualmente no navegador

Não executar instâncias simultâneas do harness. Banco local autorizado deve estar disponível com migration já aplicada; o script verifica host, porta, banco, PostgreSQL e IP do container antes de criar fixtures. Não usa seed ou migrations.

Terminal 1, no diretório do client:

```sh
SIMPLESST_ILLUSTRATIONS_LOCAL_TEST=1 node test/illustrations/local-harness.cjs --editor
```

Terminal 2, no mesmo diretório:

```sh
NEXT_PUBLIC_API_URL=http://127.0.0.1:60220 NEXT_PUBLIC_BASE_URL_API=http://127.0.0.1:60220 VERCEL_ENV=development node node_modules/next/dist/bin/next dev --webpack --hostname 127.0.0.1 --port 3000
```

Abra a URL `EDITOR_BROWSER_URL` impressa pelo primeiro terminal. Use `127.0.0.1` para não reutilizar cookies de sessões anteriores em `localhost`. A URL é temporária e autentica apenas a fixture recém-criada. Faça o ciclo Gerar → prévia → Gerar outra (confirmar/cancelar) → Aprovar → Fechar → Baixar/visualizar → Excluir. Nenhuma dessas gerações usa OpenAI real.

Feche a aba e encerre ambos os processos com Ctrl+C. O harness remove somente os próprios IDs e verifica os fingerprints; expira em 45 minutos. Next dev pode trocar automaticamente o import de tipos em `next-env.d.ts` para `.next/dev/types/routes.d.ts`; essa alteração gerada não pertence à demanda.

## Arquivos desta microetapa

API:

- `src/@v2/security/characterization/illustrations/illustration-marker.service.ts`
- `src/@v2/security/characterization/illustrations/illustration-marker.service.spec.ts`
- `src/@v2/security/characterization/illustrations/illustration.service.spec.ts` (dimensão do mock)
- `test/integration/illustrations-http-local.cjs` (dimensões/faixa)
- `test/integration/illustrations-postgres-local.cjs` (dimensões)

Client:

- `src/components/organisms/modals/ModalAddCharacterization/components/Illustrations/IllustrationsPanel.tsx`
- `test/illustrations/flow.test.cjs`
- `test/illustrations/local-harness.cjs`
- `docs/ai-characterization-illustrations-client-v1.md` (referência para os resultados atuais).
- Este documento.

## Evidências e pendências

- Prévia no editor real: `/tmp/simplesst-editor-illustration-preview-refined.png`.
- Arquivo sintético marcado: `/tmp/simplesst-illustration-marked-v2.png`.
- Faixa extraída do download: `/tmp/simplesst-downloaded-marking-band.png`.

Antes de geração real: confirmar política efetiva privada do bucket S3 e homologar modelo/usage/latência com autorização específica. Nenhuma infraestrutura foi alterada. Imagens já existentes não são reprocessadas por este ajuste; a nova marca vale para novas gerações. Correção do regex legado de e-mail é demanda separada.

## Testes pontuais desta etapa

- API `illustration-marker.service.spec.ts`: 4 testes aprovados (contraste/pixels, dimensões, cenário preservado e contexto).
- API `illustration.service.spec.ts`: 17 testes aprovados.
- PostgreSQL local `illustrations-http-local.cjs`: 8 cenários aprovados (9 nós no runner contando o agrupador).
- PostgreSQL local `illustrations-postgres-local.cjs`: 19 cenários aprovados (20 nós no runner contando o agrupador).
- Client `node --test test/illustrations/flow.test.cjs`: 13 testes aprovados, incluindo aprovação somente da tentativa nova e bloqueio após falha no descarte.
- TypeScript `noEmit` restrito ao painel afetado: zero diagnósticos no arquivo. Não equivale a type-check de todo o projeto.
- `git diff --check` em ambos os repositórios aprovado.

Nenhum build completo executado. O aviso local de Fontconfig não impediu o Sharp: a fonte empacotada foi carregada e o PNG final foi inspecionado visualmente.
