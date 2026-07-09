import { IRiskGroupData } from 'core/interfaces/api/IRiskData';

/**
 * Same selection used by the "Fatores de Riscos" tab:
 * the last risk group / inventory in the company list.
 */
export function getCurrentRiskGroupId(
  riskGroupData?: IRiskGroupData[] | null,
): string | undefined {
  if (!riskGroupData || riskGroupData.length === 0) return undefined;
  return riskGroupData[riskGroupData.length - 1]?.id;
}
