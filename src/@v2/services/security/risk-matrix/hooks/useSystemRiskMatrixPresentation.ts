import { useFetch } from '@v2/hooks/api/useFetch';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';

import { acceptSystemRiskMatrixPresentation } from '../presentation/system-risk-matrix-presentation.util';
import { readSystemRiskMatrixPresentation } from '../service/risk-matrix.service';
import { riskMatrixQueryKeys } from './risk-matrix.query-keys';

export const useFetchReadSystemRiskMatrixPresentation = (
  companyId?: string,
) => {
  return useFetch({
    queryKey: [...riskMatrixQueryKeys.systemPresentation(companyId || 'none')],
    queryFn: () => readSystemRiskMatrixPresentation(companyId as string),
    enabled: Boolean(companyId),
    refetchOnMount: true,
  });
};

export const useSystemRiskMatrixPresentation = () => {
  const { companyId } = useGetCompanyId();
  const { data, isError } = useFetchReadSystemRiskMatrixPresentation(companyId);

  if (isError) return null;
  return acceptSystemRiskMatrixPresentation(data);
};
