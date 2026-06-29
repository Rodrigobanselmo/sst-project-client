import {
  AcgihPromotionDuplicateRiskEnum,
  AcgihPromotionEligibilityStatusEnum,
  AcgihPromotionEligibilityTierEnum,
  AcgihPromotionMomentConfidenceEnum,
} from '@v2/services/medicine/acgih-promotion-preview/service/acgih-promotion-preview.types';

type ChipColor = 'default' | 'primary' | 'info' | 'success' | 'warning' | 'error';

export const tierLabels: Record<AcgihPromotionEligibilityTierEnum, string> = {
  [AcgihPromotionEligibilityTierEnum.PRIMARY]: 'Primário',
  [AcgihPromotionEligibilityTierEnum.DIVERGENCE_DERIVED]:
    'Derivado de divergência',
};

export const tierColors: Record<AcgihPromotionEligibilityTierEnum, ChipColor> = {
  [AcgihPromotionEligibilityTierEnum.PRIMARY]: 'primary',
  [AcgihPromotionEligibilityTierEnum.DIVERGENCE_DERIVED]: 'warning',
};

export const tierExplanations: Record<
  AcgihPromotionEligibilityTierEnum,
  string
> = {
  [AcgihPromotionEligibilityTierEnum.PRIMARY]:
    'Primário: candidato ACGIH/BEI confirmado sem correspondência na NR-7/Biblioteca (decisão NO_MATCH_CONFIRMED).',
  [AcgihPromotionEligibilityTierEnum.DIVERGENCE_DERIVED]:
    'Derivado de divergência: decisão técnica real (REAL_DIVERGENCE) que prevalece sobre o status bruto; só aparece com o toggle "incluir divergências reais" ligado.',
};

export const eligibilityStatusLabels: Record<
  AcgihPromotionEligibilityStatusEnum,
  string
> = {
  [AcgihPromotionEligibilityStatusEnum.ELIGIBLE]: 'Elegível',
  [AcgihPromotionEligibilityStatusEnum.WARNING]: 'Com aviso',
  [AcgihPromotionEligibilityStatusEnum.BLOCKED]: 'Bloqueado',
};

export const eligibilityStatusColors: Record<
  AcgihPromotionEligibilityStatusEnum,
  ChipColor
> = {
  [AcgihPromotionEligibilityStatusEnum.ELIGIBLE]: 'success',
  [AcgihPromotionEligibilityStatusEnum.WARNING]: 'warning',
  [AcgihPromotionEligibilityStatusEnum.BLOCKED]: 'error',
};

export const eligibilityStatusExplanations: Record<
  AcgihPromotionEligibilityStatusEnum,
  string
> = {
  [AcgihPromotionEligibilityStatusEnum.ELIGIBLE]:
    'Elegível: pronto para criação como rascunho (DRAFT), com curadoria normativa manual posterior. Ter decisão técnica não basta — só itens elegíveis são promovidos.',
  [AcgihPromotionEligibilityStatusEnum.WARNING]:
    'Com aviso: exige atenção (ex.: possível duplicidade), mas não bloqueia necessariamente a promoção futura.',
  [AcgihPromotionEligibilityStatusEnum.BLOCKED]:
    'Bloqueado: falta correção/mapeamento antes de promover (ex.: momento de coleta não mapeado). Não será promovido sem revisão.',
};

export const duplicateRiskLabels: Record<
  AcgihPromotionDuplicateRiskEnum,
  string
> = {
  [AcgihPromotionDuplicateRiskEnum.NONE]: 'Sem duplicidade',
  [AcgihPromotionDuplicateRiskEnum.ALREADY_PROMOTED]: 'Já promovido',
  [AcgihPromotionDuplicateRiskEnum.NEAR_DUPLICATE_NR7]: 'Quase-duplicado NR-7',
  [AcgihPromotionDuplicateRiskEnum.NEAR_DUPLICATE_OFFICIAL]:
    'Quase-duplicado oficial ACGIH',
};

export const duplicateRiskColors: Record<
  AcgihPromotionDuplicateRiskEnum,
  ChipColor
> = {
  [AcgihPromotionDuplicateRiskEnum.NONE]: 'default',
  [AcgihPromotionDuplicateRiskEnum.ALREADY_PROMOTED]: 'error',
  [AcgihPromotionDuplicateRiskEnum.NEAR_DUPLICATE_NR7]: 'warning',
  [AcgihPromotionDuplicateRiskEnum.NEAR_DUPLICATE_OFFICIAL]: 'warning',
};

export const momentConfidenceLabels: Record<
  AcgihPromotionMomentConfidenceEnum,
  string
> = {
  [AcgihPromotionMomentConfidenceEnum.SAFE]: 'Mapeado',
  [AcgihPromotionMomentConfidenceEnum.AMBIGUOUS]: 'Ambíguo',
  [AcgihPromotionMomentConfidenceEnum.UNMAPPED]: 'Não mapeado',
};

export const momentConfidenceColors: Record<
  AcgihPromotionMomentConfidenceEnum,
  ChipColor
> = {
  [AcgihPromotionMomentConfidenceEnum.SAFE]: 'success',
  [AcgihPromotionMomentConfidenceEnum.AMBIGUOUS]: 'warning',
  [AcgihPromotionMomentConfidenceEnum.UNMAPPED]: 'error',
};

/** Tradução amigável dos códigos de bloqueio retornados pela API (4P.1B). */
export const blockerLabels: Record<string, string> = {
  ALREADY_PROMOTED: 'Já promovido para indicador oficial',
  UNMAPPED_COLLECTION_MOMENT: 'Momento de coleta não mapeável com segurança',
  MISSING_SUBSTANCE: 'Substância ausente',
  MISSING_DETERMINANT: 'Determinante ausente',
  MISSING_MATRIX: 'Matriz biológica ausente',
  MISSING_VALUE: 'Valor de referência ausente',
  COMPLEMENTARY_REFERENCE_ACTIVE: 'Fonte complementar ativa',
  LOW_CONFIDENCE: 'Baixa confiança de transcrição',
};

/**
 * Rótulos PT dos momentos de coleta (enum BiologicalCollectionMomentEnum) para
 * exibição no preview. Keyed por string (não acopla ao enum Prisma); cai no
 * próprio código quando desconhecido. 4P.2.2 adiciona FINAL_EXPOSURE.
 */
export const collectionMomentLabels: Record<string, string> = {
  AJ: 'Antes da jornada',
  FJ: 'Final da jornada',
  FJFS: 'Final da jornada e da semana',
  AJFS: 'Antes da última jornada da semana',
  AJ48: 'Antes da jornada (após 48h)',
  NC: 'Não crítico',
  FS: 'Fim de semana',
  AJ_FJ: 'Antes e ao final da jornada',
  FINAL_EXPOSURE: 'Final da exposição',
};

export const formatCollectionMoment = (
  code?: string | null,
): string | null => {
  if (!code) return null;
  return collectionMomentLabels[code] ?? code;
};

/** Tradução amigável dos campos ausentes (missingFields). */
export const missingFieldLabels: Record<string, string> = {
  substanceName: 'Substância',
  determinant: 'Determinante',
  biologicalMatrix: 'Matriz biológica',
  referenceValue: 'Valor de referência',
  collectionMoment: 'Momento de coleta',
};

export const formatBlocker = (code: string): string =>
  blockerLabels[code] ?? code;

export const formatMissingField = (code: string): string =>
  missingFieldLabels[code] ?? code;
