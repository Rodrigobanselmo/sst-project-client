import type {
  CharacterizationTechnicalAnalysisOrigin,
  CharacterizationTechnicalRecordStatus,
  CharacterizationTechnicalRecordType,
  CharacterizationTechnicalRelatedField,
  CharacterizationTechnicalSourceStrength,
  CharacterizationTechnicalSourceType,
} from '@v2/services/security/characterization/characterization/technical-traceability/service/technical-traceability.types';

export const RECORD_TYPE_LABELS: Record<
  CharacterizationTechnicalRecordType,
  string
> = {
  DOCUMENTARY_RESEARCH: 'Pesquisa documental',
  TECHNICAL_FOUNDATION: 'Fundamentação técnica',
  EXTERNAL_AI_ANALYSIS: 'Análise com IA externa',
  EXPERT_CONSULTATION: 'Consulta a especialista',
  CLIENT_INFORMATION: 'Informação do cliente',
  TECHNICAL_NOTE: 'Nota técnica',
  REVIEW: 'Revisão',
  OTHER: 'Outro',
};

export const ANALYSIS_ORIGIN_LABELS: Record<
  CharacterizationTechnicalAnalysisOrigin,
  string
> = {
  INTERNAL_RESEARCH: 'Pesquisa interna',
  EXTERNAL_AI_USER_DECLARED: 'IA externa informada pelo usuário',
  EXPERT: 'Especialista',
  CLIENT: 'Cliente',
  TECHNICAL_RESPONSIBLE: 'Responsável técnico',
  OTHER: 'Outra origem',
};

export const RECORD_STATUS_LABELS: Record<
  CharacterizationTechnicalRecordStatus,
  string
> = {
  DRAFT: 'Rascunho',
  REVIEWED: 'Revisado',
  USED_AS_SUPPORT: 'Usado como suporte',
  SUPERSEDED: 'Substituído',
  ARCHIVED: 'Arquivado',
};

export const RELATED_FIELD_LABELS: Record<
  CharacterizationTechnicalRelatedField,
  string
> = {
  ELEMENT_NAME: 'Nome do elemento',
  DESCRIPTION: 'Descrição',
  WORK_ACTIVITIES: 'Processos/atividades',
  CONSIDERATIONS: 'Considerações',
  RISK_IDENTIFICATION: 'Identificação de riscos',
  RECOMMENDATIONS: 'Recomendações',
  REFERENCE_ONLY: 'Apenas referência, sem aplicação direta',
};

export const SOURCE_TYPE_LABELS: Record<
  CharacterizationTechnicalSourceType,
  string
> = {
  TECHNICAL_DATASHEET: 'Ficha técnica',
  PREVIOUS_PGR: 'PGR anterior',
  PREVIOUS_SST_DOCUMENT: 'Documento SST anterior',
  INSTITUTIONAL_DOCUMENT: 'Documento institucional',
  STANDARD_OR_TECHNICAL_REFERENCE: 'Norma ou referência técnica',
  WEBSITE: 'Site / página na internet',
  MARITIME_OR_CADASTRAL_DATABASE: 'Base marítima ou cadastral',
  CONTRACTUAL_DOCUMENT: 'Documento contratual',
  CLIENT_INFORMATION: 'Informação do cliente',
  PHOTOGRAPH: 'Fotografia',
  EXPERT_OPINION: 'Parecer de especialista',
  EXTERNAL_AI: 'IA externa',
  OWN_TECHNICAL_NOTE: 'Nota técnica própria',
  OTHER: 'Outra fonte',
};

export const SOURCE_STRENGTH_LABELS: Record<
  CharacterizationTechnicalSourceStrength,
  string
> = {
  HIGH: 'Alta',
  MEDIUM: 'Média',
  LOW: 'Baixa',
  NOT_APPLICABLE: 'Não aplicável',
  UNDEFINED: 'Não definida',
};

export const EXTERNAL_AI_TOOL_OPTIONS = [
  'ChatGPT',
  'Gemini',
  'Claude',
  'Copilot',
  'Outra',
] as const;

export const RECORD_TYPE_OPTIONS = Object.keys(
  RECORD_TYPE_LABELS,
) as CharacterizationTechnicalRecordType[];

export const ANALYSIS_ORIGIN_OPTIONS = Object.keys(
  ANALYSIS_ORIGIN_LABELS,
) as CharacterizationTechnicalAnalysisOrigin[];

export const RECORD_STATUS_OPTIONS = Object.keys(
  RECORD_STATUS_LABELS,
) as CharacterizationTechnicalRecordStatus[];

export const RELATED_FIELD_OPTIONS = Object.keys(
  RELATED_FIELD_LABELS,
) as CharacterizationTechnicalRelatedField[];

export const SOURCE_TYPE_OPTIONS = Object.keys(
  SOURCE_TYPE_LABELS,
) as CharacterizationTechnicalSourceType[];

export const SOURCE_STRENGTH_OPTIONS = Object.keys(
  SOURCE_STRENGTH_LABELS,
) as CharacterizationTechnicalSourceStrength[];
