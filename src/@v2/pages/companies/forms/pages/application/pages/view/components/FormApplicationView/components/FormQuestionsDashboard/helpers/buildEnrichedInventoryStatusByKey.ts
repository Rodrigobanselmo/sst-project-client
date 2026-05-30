import type { IRiskData } from 'core/interfaces/api/IRiskData';

import { buildInventoryStatusKey } from './buildInventoryStatusKey';

export function buildEnrichedInventoryStatusByKey(params: {
  inventoryStatusByKey: Record<string, boolean>;
  riskLogEntries?: Array<{
    riskId: string;
    entityId: string;
    existsInInventory?: boolean;
  }>;
  riskDataByHierarchyId?: Map<string, IRiskData[]>;
  locallyAppliedRiskKeys?: Set<string>;
}): Record<string, boolean> {
  const {
    inventoryStatusByKey,
    riskLogEntries,
    riskDataByHierarchyId,
    locallyAppliedRiskKeys,
  } = params;

  const enriched = { ...inventoryStatusByKey };

  for (const entry of riskLogEntries ?? []) {
    if (entry.existsInInventory === true) {
      enriched[buildInventoryStatusKey(entry.riskId, entry.entityId)] = true;
    }
  }

  for (const key of locallyAppliedRiskKeys ?? []) {
    enriched[key] = true;
  }

  for (const [hierarchyId, riskDataList] of riskDataByHierarchyId ?? []) {
    for (const riskData of riskDataList) {
      if (riskData.endDate) continue;
      enriched[buildInventoryStatusKey(riskData.riskId, hierarchyId)] = true;
    }
  }

  return enriched;
}
