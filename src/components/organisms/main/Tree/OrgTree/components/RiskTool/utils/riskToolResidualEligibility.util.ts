import { IRiskData } from 'core/interfaces/api/IRiskData';

const isValidRealProbability = (value: unknown): value is number =>
  typeof value === 'number' &&
  Number.isFinite(value) &&
  value >= 1 &&
  value <= 6;

/** Espelha ProbabilityAfterColumn: residual 1 só é clicável com recs e prob. real válida. */
export const canSelectResidualProbability = (
  riskData: IRiskData,
  targetProbability: number,
): boolean => {
  if (!riskData?.recs?.length) return false;
  if (!isValidRealProbability(riskData.probability)) return false;
  return targetProbability < riskData.probability + 1;
};

export const isEligibleForBulkResidualOne = (riskData: IRiskData): boolean => {
  if (!riskData?.id) return false;
  if (riskData.endDate) return false;
  if (!isValidRealProbability(riskData.probability)) return false;
  if (riskData.probabilityAfter === 1) return false;
  if (!riskData.homogeneousGroupId) return false;
  return canSelectResidualProbability(riskData, 1);
};

export const getEligibleForBulkResidualOne = (
  riskDataList: IRiskData[] | undefined,
): IRiskData[] => (riskDataList ?? []).filter(isEligibleForBulkResidualOne);
