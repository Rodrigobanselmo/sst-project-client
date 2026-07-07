import { useQuery } from 'react-query';

import { browseRiskFactorEquivalences } from '../risk-factor-equivalence.service';
import { riskFactorEquivalenceQueryKeys } from '../risk-factor-equivalence.query-keys';

type Params = {
  companyId?: string;
  aliasRiskId?: string;
  enabled?: boolean;
};

export function useFetchBrowseRiskFactorEquivalences({
  companyId,
  aliasRiskId,
  enabled = true,
}: Params) {
  return useQuery(
    riskFactorEquivalenceQueryKeys.browse(companyId || '', aliasRiskId || ''),
    () =>
      browseRiskFactorEquivalences({
        companyId: companyId!,
        aliasRiskId: aliasRiskId!,
      }),
    {
      enabled: Boolean(enabled && companyId && aliasRiskId),
      staleTime: 30_000,
    },
  );
}
