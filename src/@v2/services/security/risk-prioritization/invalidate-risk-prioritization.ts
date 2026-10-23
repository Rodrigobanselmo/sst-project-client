import { v2QueryClient } from '@v2/services/query-client';
import { RISK_PRIORITIZATION_QUERY_KEY } from './useFetchBrowseRiskPrioritization';

// A GSE may span workspaces; refresh this company's matrices in the V2 cache.
export function invalidateRiskPrioritization(companyId: string | undefined) {
  if (!companyId) return;
  return v2QueryClient.invalidateQueries({
    queryKey: [RISK_PRIORITIZATION_QUERY_KEY, companyId],
  });
}
