import { useQuery } from 'react-query';

import { searchSystemRisks } from '../risk-factor-equivalence.service';
import { riskFactorEquivalenceQueryKeys } from '../risk-factor-equivalence.query-keys';

type Params = {
  search?: string;
  type?: string;
  enabled?: boolean;
};

export function useFetchSearchSystemRisks({
  search = '',
  type,
  enabled = true,
}: Params) {
  return useQuery(
    riskFactorEquivalenceQueryKeys.searchSystemRisks(search, type),
    () => searchSystemRisks({ search, type, limit: 50 }),
    {
      enabled,
      staleTime: 60_000,
    },
  );
}
