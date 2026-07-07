import { IRiskFactors } from 'core/interfaces/api/IRiskFactors';

import { isQuantity } from './isQuantity';

export const parseDegree = (
  value?: string | number | null,
): number | undefined => {
  if (value == null) return undefined;

  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : undefined;
  }

  const trimmed = value.trim();
  if (trimmed === '') return undefined;

  const parsed = parseInt(trimmed, 10);
  return Number.isNaN(parsed) ? undefined : parsed;
};

export const resolveExamRiskMinDegreesOnSubmit = (params: {
  minRiskDegree?: string | number;
  minRiskDegreeQuantity?: string | number;
  storedMinRiskDegree?: number | null;
  storedMinRiskDegreeQuantity?: number | null;
  risk?: IRiskFactors | null;
}) => {
  const isQuantitativeApplicable = Boolean(isQuantity(params.risk));

  const fromFormQualitative = parseDegree(params.minRiskDegree);
  const minRiskDegree =
    fromFormQualitative ??
    (params.storedMinRiskDegree != null
      ? params.storedMinRiskDegree
      : 1);

  let minRiskDegreeQuantity: number | null = null;
  if (isQuantitativeApplicable) {
    const fromFormQuantitative = parseDegree(params.minRiskDegreeQuantity);
    minRiskDegreeQuantity =
      fromFormQuantitative ??
      (params.storedMinRiskDegreeQuantity != null
        ? params.storedMinRiskDegreeQuantity
        : 1);
  }

  return {
    minRiskDegree,
    minRiskDegreeQuantity,
    isQuantitativeApplicable,
  };
};
