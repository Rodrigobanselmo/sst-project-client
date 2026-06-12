import { useFetch } from '@v2/hooks/api/useFetch';
import { QueryEnum } from 'core/enums/query.enums';

import { readConsolidatedViewParticipants } from '../service/read-consolidated-view-participants.service';

export const useFetchConsolidatedViewParticipants = (
  params: {
    companyGroupId: number;
    applicationIds?: string[];
    search?: string;
    hasResponded?: boolean;
    page?: number;
    limit?: number;
  },
  options?: { enabled?: boolean },
) => {
  const { data, ...response } = useFetch({
    queryKey: [
      QueryEnum.COMPANY,
      'consolidated-view-participants',
      params.companyGroupId,
      params.applicationIds,
      params.search,
      params.hasResponded,
      params.page,
      params.limit,
    ],
    queryFn: () => readConsolidatedViewParticipants(params),
    enabled: options?.enabled ?? true,
  });

  return {
    ...response,
    participantsData: data,
  };
};
