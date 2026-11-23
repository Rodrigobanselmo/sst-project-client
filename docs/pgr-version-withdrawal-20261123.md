# Exclusão operacional de versões de documentos — 23/11/2026

Sintoma: Master não conseguia excluir uma versão oficial concluída; interface apresentava erro genérico. A implementação tentava DELETE físico de RiskFactorDocument, referenciado por SstDocumentInput com ON DELETE RESTRICT.

Correção: exclusão individual e reset de testes marcam o cabeçalho como CANCELED. Preservam o cabeçalho, os anexos, os arquivos e o registro imutável da emissão. A listagem, numeração de revisões, downloads e resumo da empresa desconsideram versões retiradas. Geração e callbacks atrasados não reativam o cabeçalho. A autorização continua exigindo Master e a última versão oficial da série.

Reset oficial continua iniciando uma nova série, sem excluir arquivos de séries anteriores; o tooltip explica a indisponibilidade quando a série atual está vazia. A confirmação de exclusão descreve a preservação do histórico.

Sem alterações de schema ou migrations; sem exclusão ou intervenção direta no documento de produção. Validação: 53 testes de exclusão, preservação de emissão e geração; testes de helpers do client; TypeScript e builds de produção. Publicação da API deve preceder o client.
