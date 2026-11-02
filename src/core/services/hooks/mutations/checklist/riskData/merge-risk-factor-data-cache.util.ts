import { QueryEnum } from '../../../../../enums/query.enums';

/**
 * Identidade de cache do RFD compartilhado: homogeneousGroupId + riskId
 * (+ riskFactorGroupDataId quando os dois tiverem, ou id).
 * workspaceId NÃO é identidade do RFD; só separa query keys de overlay.
 */

export type RiskFactorDataCacheIdentity = {
  id?: string | null;
  riskId?: string | null;
  homogeneousGroupId?: string | null;
  riskFactorGroupDataId?: string | null;
};

export function isSameRiskFactorDataCacheRow(
  item: RiskFactorDataCacheIdentity,
  incoming: RiskFactorDataCacheIdentity,
): boolean {
  // Two persisted records can never be merged by the legacy owner/risk fallback.
  if (item.id && incoming.id) {
    return item.id === incoming.id;
  }

  if (!item.riskId || !incoming.riskId || item.riskId !== incoming.riskId) {
    return false;
  }
  if (
    !item.homogeneousGroupId ||
    !incoming.homogeneousGroupId ||
    item.homogeneousGroupId !== incoming.homogeneousGroupId
  ) {
    return false;
  }
  if (
    item.riskFactorGroupDataId &&
    incoming.riskFactorGroupDataId &&
    item.riskFactorGroupDataId !== incoming.riskFactorGroupDataId
  ) {
    return false;
  }
  return true;
}

export function mergeRiskFactorDataCacheList<T extends RiskFactorDataCacheIdentity>(
  old: T[] | undefined,
  incoming: T,
): T[] | undefined {
  if (!Array.isArray(old)) return old;
  return old.map((item) =>
    isSameRiskFactorDataCacheRow(item, incoming) ? { ...item, ...incoming } : item,
  );
}

export function riskFactorDataByGhoQueryKey(params: {
  companyId?: string;
  riskFactorGroupDataId?: string | null;
  homogeneousGroupId?: string | null;
  workspaceId?: string | null;
  effective?: boolean;
}): Array<string | undefined> {
  const key: Array<string | undefined> = [
    QueryEnum.RISK_DATA,
    params.companyId,
    params.riskFactorGroupDataId || undefined,
    params.homogeneousGroupId || undefined,
  ];
  if (params.effective) key.push('effective');
  key.push(params.workspaceId || undefined);
  return key;
}

/** Visualização por risco. O estabelecimento fica no fim para o prefixo invalidar todos. */
export function riskDataByRiskQueryKey(params: {
  companyId?: string;
  riskGroupId?: string | null;
  riskId?: string | null;
  workspaceId?: string | null;
}): Array<string | undefined> {
  return [
    QueryEnum.RISK_DATA,
    params.companyId,
    params.riskGroupId || undefined,
    params.riskId || undefined,
    params.workspaceId || undefined,
  ];
}

export function riskDataByRiskQueryKeyPrefix(params: {
  companyId?: string;
  riskGroupId?: string | null;
  riskId?: string | null;
}): Array<string | undefined> {
  return riskDataByRiskQueryKey(params).slice(0, 4);
}

/** Prefixo compartilhado: invalida overlay de todos os workspaceId daquele GHO. */
export function riskFactorDataByGhoQueryKeyPrefix(params: {
  companyId?: string;
  riskFactorGroupDataId?: string | null;
  homogeneousGroupId?: string | null;
}): Array<string | undefined> {
  return [
    QueryEnum.RISK_DATA,
    params.companyId,
    params.riskFactorGroupDataId || undefined,
    params.homogeneousGroupId || undefined,
  ];
}
