import { useFetch } from '@v2/hooks/api/useFetch';
import { BrowseCharacterizationParams } from '../service/browse-characterization.types';
import { browseCharacterization } from '../service/browse-characterization.service';
import { QueryKeyEnum } from '@v2/constants/enums/query-key.enum';

export const useFetchBrowseCharaterizations = (
  params: BrowseCharacterizationParams,
) => {
  const { data, ...response } = useFetch({
    queryFn: async () => {
      return browseCharacterization(params);
    },
    queryKey: [
      QueryKeyEnum.CHARACTERIZATIONS,
      params.companyId,
      params.workspaceId,
      params,
    ],
  });

  return {
    ...response,
    characterizations: data,
  };
};
