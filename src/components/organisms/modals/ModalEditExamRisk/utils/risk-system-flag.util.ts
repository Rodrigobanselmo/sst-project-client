import { QueryEnum } from 'core/enums/query.enums';
import { IRiskFactors } from 'core/interfaces/api/IRiskFactors';
import { queryClient } from 'core/services/queryClient';

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
 * Exam-risk list omits `system`. Enrich from React Query cache only — not via
 * GET /risk/:companyId/:id, which 404s for consultant-owned risks (e.g. CONNAPA aliases).
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

/** Non-system when explicitly false, or when `system` is absent (exam-risk list omits it). */
export function isNonSystemRisk(risk?: IRiskFactors | null): boolean {
  if (!risk?.id) return false;
  return risk.system !== true;
}
