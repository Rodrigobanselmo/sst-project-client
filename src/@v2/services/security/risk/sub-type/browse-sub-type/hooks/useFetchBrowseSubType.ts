import { useFetch } from '@v2/hooks/api/useFetch';
import { browseSubType } from '../service/browse-sub-type.service';
import { BrowseSubTypeParams } from '../service/browse-sub-type.types';
import { QueryKeySubTypeEnum } from '@v2/constants/enums/sub-type-query-key.enum';

export const getKeyBrowseSubType = (params: BrowseSubTypeParams) => {
  return [QueryKeySubTypeEnum.SUB_TYPE, params.companyId, params];
};

export const useFetchBrowseRiskSubType = (params: BrowseSubTypeParams) => {
  const { data, ...response } = useFetch({
    queryFn: async () => {
      return browseSubType(params);
    },
    queryKey: getKeyBrowseSubType(params),
  });

  return {
    ...response,
    subTypes: data,
  };
};
