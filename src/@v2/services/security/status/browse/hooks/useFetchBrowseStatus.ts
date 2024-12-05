import { QueryKeyCharacterizationEnum } from '@v2/constants/enums/characterization-query-key.enum';
import { useFetch } from '@v2/hooks/api/useFetch';
import {
  browseStatus,
  BrowseStatusParams,
} from '../service/browse-status.service';

export const getKeyBrowseStatus = (params: BrowseStatusParams) => {
  return [QueryKeyCharacterizationEnum.CHARACTERIZATIONS_STATUS, params.companyId, params];
};

export const useFetchBrowseStatus = (params: BrowseStatusParams) => {
  const { data, ...response } = useFetch({
    queryFn: async () => {
      return browseStatus(params);
    },
    queryKey: getKeyBrowseStatus(params),
  });

  return {
    ...response,
    status: data,
  };
};
