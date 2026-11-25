# Publicação — assistente de banner de campanha — 25/11/2026

## Escopo homologado

Botão de criar/editar banner em aplicações não psicossociais; sugestão inicial com título e objetivo, três campos editáveis, prévia A4 com QR/link/identidade e tempo de resposta, impressão e gravação nos campos existentes por campanha. Mensagem de privacidade determinística por modalidade, fora da resposta editável da IA. Assistência com gpt-6.1-sol e componente de transcrição de áudio já existente. Temas claro e escuro conferidos no piloto local SEFAZ Bahia.

A campanha local usada no piloto não é copiada para produção. O usuário poderá gerar o banner na aplicação operacional. Nenhuma resposta de participante é enviada à IA. O PDF usa a apresentação clara de impressão.

## Validação

TypeScript; dois testes de modalidade/default genérico; geração real de IA e gravação/reabertura na campanha local aprovadas. Gravação real de áudio e diálogo nativo de impressão não homologados automaticamente. Build de produção --webpack aprovado. Commit funcional 37bbd501f0f876cc9ababcb7f36285aadb3de1fc publicado em main; Vercel confirmou success para a implantação 4Xrc1a5SAsSoXfWwULArpTbmRRmK, deployment GitHub 8055644881 em Production. API funcional fcfcaa7b90e7e1b5f9d8cc8e57215f30e590a25d implantada antes pelo Actions 45600006070, com migrations sem pendências.

## Compatibilidade

Reutiliza bannerIntroText/bannerWhyText/bannerContactText; sem migration. API publicada antes do client. Nenhuma mudança de ambiente, dependência, workflow ou next-env.d.ts incluída. Alterações de outras frentes preservadas.
