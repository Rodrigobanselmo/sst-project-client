import type { IRiskFactors } from 'core/interfaces/api/IRiskFactors';

// Exam configuration only. Measurement classification in isQuantity is unchanged.
export const isExamRiskQuantityApplicable = (
  risk?: Partial<IRiskFactors> | null,
) => risk?.quantitativeLimitApplicable === true;
