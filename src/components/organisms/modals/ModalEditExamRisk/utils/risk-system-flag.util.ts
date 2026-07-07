import { QueryEnum } from 'core/enums/query.enums';
import { IRiskFactors } from 'core/interfaces/api/IRiskFactors';
import { queryClient } from 'core/services/queryClient';
import type { SystemRiskSearchItem } from '@v2/services/risk-factor-equivalence/risk-factor-equivalence.types';

export function normalizeAgentName(value?: string | null): string | null {
  if (!value) return null;
  const normalized = value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();
  return normalized || null;
}

export function findRiskInClientCache(
  riskId: string,
): IRiskFactors | undefined {
  const queries = queryClient.getQueriesData<
    IRiskFactors[] | { data?: IRiskFactors[] }
  >([QueryEnum.RISK]);

  for (const [, data] of queries) {
    const list = Array.isArray(data) ? data : data?.data;
    if (!list?.length) continue;

    const found = list.find((item) => item.id === riskId);
    if (found) return found;
  }

  return undefined;
}

/**
 * Enrich from React Query cache only — not via GET /risk/:companyId/:id,
 * which 404s for consultant-owned risks (e.g. CONNAPA aliases).
 */
export function enrichRiskWithSystemFlag(
  risk?: IRiskFactors,
): IRiskFactors | undefined {
  if (!risk?.id) return risk;
  if (typeof risk.system === 'boolean') return risk;

  const cached = findRiskInClientCache(risk.id);
  if (!cached || typeof cached.system !== 'boolean') return risk;

  return {
    ...risk,
    system: cached.system,
    type: risk.type || cached.type,
    companyId: risk.companyId || cached.companyId,
  };
}

export function isCatalogSystemRisk(risk?: IRiskFactors | null): boolean {
  return risk?.system === true;
}

export function isExplicitNonSystemRisk(risk?: IRiskFactors | null): boolean {
  return risk?.system === false;
}

export function isRiskIdInSystemSearchResults(
  riskId: string | undefined,
  systemRisks: SystemRiskSearchItem[],
): boolean {
  if (!riskId) return false;
  return systemRisks.some((item) => item.id === riskId);
}

export function findExactCanonicalSuggestion(
  risk: IRiskFactors | undefined,
  systemRisks: SystemRiskSearchItem[],
): SystemRiskSearchItem | null {
  if (!risk?.id || !risk.name || !risk.type) return null;

  const normalizedAlias = normalizeAgentName(risk.name);
  if (!normalizedAlias) return null;

  return (
    systemRisks.find(
      (item) =>
        item.id !== risk.id &&
        item.type === risk.type &&
        normalizeAgentName(item.name) === normalizedAlias,
    ) ?? null
  );
}

export function requiresEquivalenceForPublish(params: {
  risk?: IRiskFactors | null;
  riskIsCatalogForPublish?: boolean;
  existingEquivalence?: { canonicalRiskId: string } | null;
}): boolean {
  if (!params.risk?.id) return false;
  if (params.riskIsCatalogForPublish || isCatalogSystemRisk(params.risk)) {
    return false;
  }
  if (params.existingEquivalence) return false;
  return true;
}
