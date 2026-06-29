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
    'Candidato ACGIH confirmado sem correspondência (NO_MATCH_CONFIRMED).',
  [AcgihPromotionEligibilityTierEnum.DIVERGENCE_DERIVED]:
    'Candidato derivado de divergência técnica real (REAL_DIVERGENCE), incluído apenas com o toggle ligado.',
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
    'Seria criado futuramente como rascunho (DRAFT), com curadoria normativa manual posterior. Nada é criado nesta etapa.',
  [AcgihPromotionEligibilityStatusEnum.WARNING]:
    'Exige atenção (ex.: possível duplicidade), mas não bloqueia necessariamente a promoção futura.',
  [AcgihPromotionEligibilityStatusEnum.BLOCKED]:
    'Não será promovido sem correção/revisão. Verifique os bloqueios listados.',
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
