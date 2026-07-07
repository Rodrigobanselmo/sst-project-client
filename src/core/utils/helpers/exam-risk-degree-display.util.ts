import { matrixRiskMap } from 'core/constants/maps/matriz-risk.constant';
import { IRiskFactors } from 'core/interfaces/api/IRiskFactors';
import { isQuantity } from 'core/utils/helpers/isQuantity';

export type ExamRiskQuantityDisplayRef =
  | IRiskFactors
  | Pick<IRiskFactors, 'type' | 'esocialCode'>
  | { type?: string; esocialCode?: string | null }
  | null
  | undefined;

export const formatExamRiskQualitativeDegreeLabel = (
  value?: number | null,
) => {
  if (!value) return '-';
  return matrixRiskMap[value as keyof typeof matrixRiskMap]?.label || '-';
};

export const formatExamRiskQuantitativeDegreeLabel = (
  value: number | null | undefined,
  risk?: ExamRiskQuantityDisplayRef,
) => {
  if (!isQuantity(risk as IRiskFactors | null)) {
    return 'Não aplicável';
  }

  if (!value) return '-';
  return matrixRiskMap[value as keyof typeof matrixRiskMap]?.label || '-';
};

export const isExamRiskQuantitativeApplicable = (
  risk?: ExamRiskQuantityDisplayRef,
) => Boolean(isQuantity(risk as IRiskFactors | null));
