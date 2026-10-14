import { SystemAiPromptKeyEnum } from '@v2/constants/enums/system-ai-prompt-key.enum';

import type { SuggestCatalogRisksContextKind } from './resolve-suggest-catalog-risks-context.util';

/** Padrões de fábrica (espelho do backend). Usados no restore local se a API falhar. */
export const CATALOG_ONLY_GSE_IDENTIFICATION_GUIDANCE_DEFAULT = `ORIENTAÇÕES FUNCIONAIS — IDENTIFICAÇÃO DE FATORES (GSE / catalog-only):
- Trate NOME, DESCRIÇÃO e CARGOS do GSE como evidência técnica principal de exposição ocupacional.
- Confrontar exposições explícitas ou tecnicamente plausíveis com a Base de Conhecimento de Riscos Disponíveis.
- Preferir fatores específicos do catálogo quando o mecanismo de exposição estiver claro no texto.
- Elementos de origem, fotos e userGuidance são evidências adicionais — não pré-requisitos.
- Não omitir exposições explícitas da descrição/cargos só porque faltam fotos ou elementos.
- Manter cautela: sem mecanismo defensável, prefira não sugerir espontaneamente (lista vazia é válida).
- Quando o usuário citar o nome exato de um fator do catálogo, isso é orientação válida a avaliar — distinto de aproximação semântica.`;

export const CATALOG_ONLY_CHARACTERIZATION_IDENTIFICATION_GUIDANCE_DEFAULT = `ORIENTAÇÕES FUNCIONAIS — IDENTIFICAÇÃO DE FATORES (Elemento caracterizável / catalog-only):
- Use Nome, Parágrafos de descrição, Atividades/processos e Considerações como evidência principal da exposição no elemento.
- Confrontar o conteúdo desses campos com a Base de Conhecimento de Riscos Disponíveis.
- Em caracterizações ricas, priorize extrair exposições concretas (agentes, condições, tarefas) e mapear a fatores específicos do catálogo.
- Fotos e dados ambientais são apoio; não invente exposição só por ambiente industrial genérico.
- Não omitir riscos novos tecnicamente sustentados nos textos só porque a caracterização é longa ou narrativa.
- Sem mecanismo defensável, prefira não sugerir espontaneamente (lista vazia é válida).
- Quando o usuário citar o nome exato de um fator do catálogo, isso é orientação válida a avaliar — distinto de aproximação semântica.`;

/** Regras protegidas em código — somente leitura no diálogo master. */
export const CATALOG_ONLY_PROTECTED_RULES_SUMMARY = [
  'Uso exclusivo de fatores ativos do catálogo permitido (IDs da Base de Conhecimento).',
  'Proibição de inventar fatores ou IDs fora do catálogo.',
  'Regras de FRPS / exclusão de fatores psicossociais não vinculados quando aplicável.',
  'Exclusão de fatores já vinculados diretamente ao contexto.',
  'Tratamento de fatores solicitados explicitamente pelo usuário (orientação a avaliar, sem inclusão automática).',
  'Ausência de preenchimento automático de probabilidade, severidade, controles e recomendações.',
  'Preservação do inventário, PGR e plano de ação (análise catalog-only não grava esses campos).',
  'A orientação funcional editável é complementar e NÃO substitui estas regras.',
];

export const CATALOG_ONLY_GSE_CONTEXT_FIELDS = [
  'Nome do GSE',
  'Descrição do GSE',
  'Cargos vinculados',
  'Elementos de origem (quando houver)',
  'Riscos já vinculados ao GSE',
  'Base de Conhecimento (catálogo permitido)',
  'Orientação do usuário (userGuidance)',
  'Documentos temporários anexados (quando houver)',
];

export const CATALOG_ONLY_CHARACTERIZATION_CONTEXT_FIELDS = [
  'Nome do elemento',
  'Parágrafos de descrição',
  'Atividades / processos',
  'Considerações',
  'Fotos e dados ambientais (quando houver)',
  'Riscos já vinculados',
  'Base de Conhecimento (catálogo permitido)',
  'Orientação do usuário (userGuidance)',
  'Documentos temporários anexados (quando houver)',
];

export function resolveCatalogOnlyIdentificationGuidancePromptKey(
  kind: SuggestCatalogRisksContextKind,
): SystemAiPromptKeyEnum {
  return kind === 'gse'
    ? SystemAiPromptKeyEnum.CATALOG_ONLY_GSE_IDENTIFICATION_GUIDANCE
    : SystemAiPromptKeyEnum.CATALOG_ONLY_CHARACTERIZATION_IDENTIFICATION_GUIDANCE;
}

export function resolveCatalogOnlyIdentificationGuidanceFactoryDefault(
  kind: SuggestCatalogRisksContextKind,
): string {
  return kind === 'gse'
    ? CATALOG_ONLY_GSE_IDENTIFICATION_GUIDANCE_DEFAULT
    : CATALOG_ONLY_CHARACTERIZATION_IDENTIFICATION_GUIDANCE_DEFAULT;
}

export function resolveCatalogOnlyContextFields(
  kind: SuggestCatalogRisksContextKind,
): string[] {
  return kind === 'gse'
    ? CATALOG_ONLY_GSE_CONTEXT_FIELDS
    : CATALOG_ONLY_CHARACTERIZATION_CONTEXT_FIELDS;
}
