import { useFetch } from '@v2/hooks/api/useFetch';
import { useInfiniteFetch } from '@v2/hooks/api/useInfiniteFetch';
import { BrowseRisksParams } from '../service/browse-risks.types';
import { browseRisks } from '../service/browse-risks.service';
import { QueryKeyFormEnum } from '@v2/constants/enums/form-query-key.enum';
import { QueryKeyEnum } from '@v2/constants/enums/@query-key.enum';

export const useFetchBrowseRisks = (params: BrowseRisksParams) => {
  console.log('useFetchBrowseRisks called with params:', params);

  const { data, ...response } = useFetch({
    queryFn: async () => {
      console.log('queryFn called, calling browseRisks with:', params);
      return browseRisks(params);
    },
    queryKey: [QueryKeyFormEnum.FORM_RISKS, params.companyId, params],
    enabled: !!params.companyId,
  });

  console.log('useFetchBrowseRisks response:', {
    data,
    isLoading: response.isLoading,
    error: response.error,
  });

  return {
    ...response,
    risks: data,
  };
};

export const useInfinityFetchBrowseRisks = (params: BrowseRisksParams) => {
  const { data, ...response } = useInfiniteFetch({
    queryFn: async ({ page }) => {
      return browseRisks({
        ...params,
        pagination: {
          page: page,
          limit: params.pagination?.limit || 10,
        },
      });
    },
    getNextPageParam: (lastPage) => {
      return lastPage.pagination.nextPage;
    },
    queryKey: [
      QueryKeyFormEnum.FORM_RISKS,
      params.companyId,
      params,
      QueryKeyEnum.INFINITE,
    ],
    enabled: !!params.companyId,
  });

  return {
    ...response,
    risks: data,
  };
};
