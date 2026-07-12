import { RecTypeEnum } from 'project/enum/recType.enum';

export const MISSING_REC_TYPE_TOOLTIP =
  'Classifique esta recomendação como Administrativa, Engenharia ou EPI para que ela seja considerada no cálculo da probabilidade residual.';

export const MISSING_REC_TYPE_QUICK_CLASSIFY_MESSAGE =
  'Classifique esta recomendação para que ela seja considerada no cálculo da probabilidade residual.';

export const MISSING_REC_TYPE_RESIDUAL_HINT =
  'Há recomendações sem classificação que não foram consideradas no cálculo.';

const KNOWN_REC_TYPES = new Set<string>([
  RecTypeEnum.ADM,
  RecTypeEnum.ENG,
  RecTypeEnum.EPI,
]);

/** `recType` ausente, vazio ou fora de ADM/ENG/EPI. */
export const isRecommendationRecTypeMissing = (
  recType?: RecTypeEnum | string | null,
): boolean => {
  if (recType == null) return true;
  const normalized = String(recType).trim();
  if (!normalized) return true;
  return !KNOWN_REC_TYPES.has(normalized);
};
