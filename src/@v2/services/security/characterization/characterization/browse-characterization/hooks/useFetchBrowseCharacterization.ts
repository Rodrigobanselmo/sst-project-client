import { QueryKeyCharacterizationEnum } from '@v2/constants/enums/characterization-query-key.enum';
import { useFetch } from '@v2/hooks/api/useFetch';
import { browseCharacterization } from '../service/browse-characterization.service';
import { BrowseCharacterizationParams } from '../service/browse-characterization.types';

export const useFetchBrowseCharaterizations = (
  params: BrowseCharacterizationParams,
) => {
  const { data, ...response } = useFetch({
    queryFn: async () => {
      return browseCharacterization(params);
    },
    queryKey: [
      QueryKeyCharacterizationEnum.CHARACTERIZATIONS,
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
