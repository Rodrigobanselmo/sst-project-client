import { QueryKeyCompanyEnum } from '@v2/constants/enums/company-query-key.enum';
import { useFetch } from '@v2/hooks/api/useFetch';
import { readVisualIdentity } from '../service/read-visual-identity.service';
import { ReadVisualIdentityParams } from '../service/read-visual-identity.types';

export const useFetchVisualIdentity = (params: ReadVisualIdentityParams) => {
  const { data, ...response } = useFetch({
    queryFn: async () => {
      return readVisualIdentity(params);
    },
    queryKey: [QueryKeyCompanyEnum.VISUAL_IDENTITY, params.companyId],
    enabled: !!params.companyId,
  });

  return {
    ...response,
    visualIdentity: data,
  };
};
