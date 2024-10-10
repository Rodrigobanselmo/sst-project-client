import { useFetch } from '@v2/hooks/api/useFetch';
import {
  browseStatus,
  BrowseStatusParams,
} from '../service/browse-status.service';
import { QueryKeyEnum } from '@v2/constants/enums/query-key.enum';

export const getKeyBrowseStatus = (params: BrowseStatusParams) => {
  return [QueryKeyEnum.STATUS, params.companyId, params];
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
