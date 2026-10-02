import { useQuery } from 'react-query';
import queryString from 'query-string';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { QueryEnum } from 'core/enums/query.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { api } from 'core/services/apiClient';

import {
  ApplicableJourneys,
  emptyApplicableJourneys,
  normalizeApplicableJourneys,
} from './applicable-journeys.util';
import { ProbabilityCountSource } from './qualitative-probability.util';

export type {
  ApplicableJourneyOption,
  ApplicableJourneys,
  JourneyConsistencyStatus,
} from './applicable-journeys.util';
export { normalizeApplicableJourneys } from './applicable-journeys.util';

export function useApplicableJourneys(source?: ProbabilityCountSource) {
  const { companyId } = useGetCompanyId();
  const hierarchyId = source?.hierarchyId || '';
  const homogeneousGroupId = source?.homogeneousGroupId || '';
  const enabled =
    !!companyId && !source?.allWorkspaces && !!(hierarchyId || homogeneousGroupId);

  const query = useQuery(
    [QueryEnum.COMPANY_SHIFT_JOURNEYS, companyId, hierarchyId, homogeneousGroupId],
    async () => {
      const params = queryString.stringify({
        hierarchyId: hierarchyId || undefined,
        homogeneousGroupId: homogeneousGroupId || undefined,
      });
      const response = await api.get<ApplicableJourneys>(
        `${ApiRoutesEnum.COMPANY_SHIFTS}/applicable?${params}`.replace(':companyId', companyId || ''),
      );
      return normalizeApplicableJourneys(response.data);
    },
    { enabled, staleTime: 1000 * 30 },
  );

  const data = query.data ?? emptyApplicableJourneys;
  return {
    ...data,
    ready: !enabled || (!query.isLoading && query.isFetched),
  };
}
