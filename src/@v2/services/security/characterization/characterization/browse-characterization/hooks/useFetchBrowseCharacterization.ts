import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { QueryKeyCharacterizationEnum } from '@v2/constants/enums/characterization-query-key.enum';
import { browseCharacterization } from '../service/browse-characterization.service';
import { BrowseCharacterizationParams } from '../service/browse-characterization.types';

export const useFetchBrowseCharaterizations = (
  params: BrowseCharacterizationParams,
  options?: {
    enabled?: boolean;
  },
) => {
  const { data, ...response } = useQuery({
    queryFn: async ({ signal }) => {
      return browseCharacterization(params, { signal });
    },
    queryKey: [
      QueryKeyCharacterizationEnum.CHARACTERIZATIONS,
      params.companyId,
      params.workspaceId,
      params,
    ],
    enabled: options?.enabled ?? true,
    refetchOnMount: true,
    placeholderData: keepPreviousData,
  });

  return {
    ...response,
    characterizations: data,
  };
};
