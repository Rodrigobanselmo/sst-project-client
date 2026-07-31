import type {
  NarrativeStance,
  StructureAttentionLevel,
  StructureFindingCategory,
} from '@v2/services/security/exposure-group-assistant/service/exposure-group-assistant.types';

export const ATTENTION_LEVEL_LABEL_PT: Record<StructureAttentionLevel, string> = {
  INFORMATIONAL: 'Informativo',
  ATTENTION: 'Atenção',
  RELEVANT: 'Relevante',
  PRIORITY: 'Prioritário',
};

export const STANCE_LABEL_PT: Record<NarrativeStance, string> = {
  OPPORTUNITY: 'Oportunidade',
  ATTENTION_POINT: 'Ponto de atenção',
  EXPECTED_SITUATION: 'Situação esperada',
  REVIEW_RECOMMENDED: 'Revisão recomendada',
  INTERVENTION_LIKELY: 'Intervenção recomendada',
};

export const FINDING_CATEGORY_LABEL_PT: Record<StructureFindingCategory, string> = {
  COVERAGE: 'Cobertura e vínculos',
  INTEGRITY: 'Integridade',
  COMPLETENESS: 'Completude',
  FRAGMENTATION: 'Fragmentação',
  DATA_INSUFFICIENT: 'Limitações para análise',
  EXISTING_GSE_REVIEW: 'Agrupamentos existentes',
};

export const FINDING_CATEGORY_ORDER: StructureFindingCategory[] = [
  'COVERAGE',
  'INTEGRITY',
  'COMPLETENESS',
  'FRAGMENTATION',
  'DATA_INSUFFICIENT',
  'EXISTING_GSE_REVIEW',
];

export function formatPercent(ratio: number): string {
  return `${Math.round(ratio * 100)}%`;
}

export function formatDateTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString('pt-BR');
  } catch {
    return iso;
  }
}

export function maturityLabel(maturity: string): string {
  if (maturity === 'EMPTY') return 'Vazio';
  if (maturity === 'PARTIAL') return 'Parcial';
  if (maturity === 'MATURE') return 'Maduro';
  return maturity;
}
