import { useFetch } from '@v2/hooks/api/useFetch';
import { BrowseStatusParams } from '../service/browse-status.types';
import { browseStatus } from '../service/browse-status.service';
import { QueryKeyEnum } from '@v2/constants/enums/query-key.enum';

export const useFetchBrowseStatus = (params: BrowseStatusParams) => {
  const { data, ...response } = useFetch({
    queryFn: async () => {
      return browseStatus(params);
    },
    queryKey: [QueryKeyEnum.STATUS, params.companyId, params],
  });

  return {
    ...response,
    status: data,
  };
};
