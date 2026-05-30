import type { IRiskData } from 'core/interfaces/api/IRiskData';
import { queryRiskData } from 'core/services/hooks/queries/useQueryRiskData';
import { queryRiskData as queryRiskDataByHierarchy } from 'core/services/hooks/queries/useQueryRiskDataByHierarchy';

function belongsToHierarchy(riskData: IRiskData, hierarchyId: string) {
  return (
    riskData.hierarchyId === hierarchyId ||
    riskData.homogeneousGroupId === hierarchyId
  );
}

/**
 * O endpoint `/hierarchy/:id` retorna RiskFactorData sem fontes/recs/medidas.
 * Para reconstruir status de itens de IA, busca o resumo por hierarquia e
 * complementa com o endpoint completo `/:groupId/:riskId`.
 */
export async function fetchFullRiskDataForHierarchy(
  companyId: string,
  hierarchyId: string,
): Promise<IRiskData[]> {
  const summaryRows = await queryRiskDataByHierarchy(companyId, hierarchyId);
  if (!summaryRows.length) return [];

  const summaryIdsForHierarchy = new Set(
    summaryRows
      .filter((row) => belongsToHierarchy(row, hierarchyId))
      .map((row) => row.id),
  );

  const pairs = new Map<
    string,
    { riskFactorGroupDataId: string; riskId: string }
  >();
  for (const row of summaryRows) {
    if (!row.riskFactorGroupDataId || !row.riskId) continue;
    if (!belongsToHierarchy(row, hierarchyId)) continue;
    pairs.set(`${row.riskFactorGroupDataId}:${row.riskId}`, {
      riskFactorGroupDataId: row.riskFactorGroupDataId,
      riskId: row.riskId,
    });
  }

  if (pairs.size === 0) return summaryRows;

  const fullRows = (
    await Promise.all(
      [...pairs.values()].map(({ riskFactorGroupDataId, riskId }) =>
        queryRiskData(companyId, riskFactorGroupDataId, riskId),
      ),
    )
  ).flat();

  const deduped = new Map<string, IRiskData>();
  for (const row of fullRows) {
    if (row.endDate) continue;
    if (
      belongsToHierarchy(row, hierarchyId) ||
      summaryIdsForHierarchy.has(row.id)
    ) {
      deduped.set(row.id, row);
    }
  }

  return [...deduped.values()];
}
