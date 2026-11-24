# Agrupamentos FRPS com IA — publicação homologada em 24/11/2026

O usuário homologou a geração, revisão e criação de agrupamentos no ambiente local e autorizou a publicação. O remanejamento/renomeação das propostas antes de aplicar fica para evolução posterior.

## Entrega

Assistente com GPT-6.1 Sol (`gpt-6.1-sol`) como padrão explícito, sem fallback silencioso. Comparação entre empresas separadas e integradas. Propostas categorizadas por baixa resposta, composição mista e visão ampliada. Contrato integral, evidências, confirmação técnica e suficiência calculada por pergunta. Aplicação preserva grupos existentes e rejeita contexto desatualizado ou escopo inválido.

A revisão apresenta abas destacadas e níveis inicialmente recolhidos, confirmação final em diálogo próprio, indicador de gravação/atualização e mensagens de erro. Contexto opcional com exemplo e microfone; usa o endpoint de transcrição já existente, sem nova integração de modelo. Equalizador decorativo animado durante gravação, respeitando redução de movimento.

Rascunhos são temporários: mesma conta/campanha/contexto, no mesmo processo, até 30 minutos. Não há persistência durável das propostas ou seleções. Grupos efetivamente aplicados são persistidos normalmente. O áudio transcrito pode ser revisado antes da análise. Não são enviados à análise nomes de empregados, respostas individuais ou scores.

## Validação e implantação

54 testes pertinentes da API aprovados. Teste do fluxo do client com contexto sintético: confirmação antes do POST, recolhimento, estado ocupado, recuperação de erro e sucesso com invalidação das consultas. Homologação real do usuário inclui criação dos grupos. Build e TypeScript em cópias isoladas.

Nenhuma alteração em schema, migrations, workflows, credenciais ou configuração operacional. Base API 75f5a7a1; último deploy Actions 45405571148 com sucesso, 475 migrations e nenhuma pendente. Publicação API em master antes do client em main; documentação separada do commit funcional. Alterações alheias de áudio e outras frentes locais foram preservadas fora desta entrega.

## API publicada

Commit funcional `37e7bb25bc7ae90d4f20a1e8364e0d0fe275ddf5`, master. Actions [45426989802](https://github.com/Rodrigobanselmo/sst-project-api/actions/runs/45426989802): concluído com sucesso; 475 migrations encontradas e nenhuma pendente; API e worker online após reinicialização.

Client funcional `c52d3f55`: validação local usa Webpack porque a cópia isolada tem node_modules por symlink fora da raiz do Turbopack. Variáveis locais somente no processo de build, sem arquivo de credenciais no checkout ou alteração da configuração de produção.
