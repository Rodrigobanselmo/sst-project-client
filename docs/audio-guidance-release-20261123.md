# Gravação das orientações adicionais

Homologada localmente pelo usuário em 23/11/2026, com publicação expressamente autorizada.

O gravador compartilhado coleta os trechos desde o início, aguarda a finalização do encoder, evita operações repetidas e isola sessões canceladas. A interface informa abertura, finalização e transcrição, permite cancelar e apresenta erros de gravação ou tempo excedido. Os serviços de transcrição usados nesses diálogos passam a ter timeout de 120 segundos.

Abrange caracterização, GSE, análise de riscos da hierarquia, sugestões do catálogo e assistência visual do GSE que reutilizam o campo. Outros gravadores independentes não fazem parte da alteração. Sem mudança de modelo, API, schema, migrations, credenciais ou dados.

Validação: testes de coleta de chunks e ciclo do hook (finalização atrasada, MIME MP4, ausência de evento stop, erro do gravador, cliques repetidos, cancelamento e respostas tardias), TypeScript e build de produção. Gravação real homologada no ambiente local pelo usuário; teste em produção será feito pelo usuário após o deploy.
