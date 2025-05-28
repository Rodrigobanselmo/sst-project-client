import { QueryKeyEnum } from '@v2/constants/enums/@query-key.enum';
import { QueryKeyFormEnum } from '@v2/constants/enums/form-query-key.enum';
import { useInfiniteFetch } from '@v2/hooks/api/useInfiniteFetch';
import { browseForm } from '../service/browse-form-model.service';
import { BrowseFormModelParams } from '../service/browse-form-model.types';

export const useInfinityBrowseFormModel = (params: BrowseFormModelParams) => {
  const { data, ...response } = useInfiniteFetch({
    queryFn: async ({ page }) => {
      return browseForm({
        ...params,
        pagination: {
          ...params.pagination,
          page: page,
        },
      });
    },
    getNextPageParam: (lastPage) => {
      return lastPage.pagination.nextPage;
    },
    queryKey: [
      QueryKeyFormEnum.FORM_MODEL,
      params.companyId,
      params,
      QueryKeyEnum.INFINITE,
    ],
  });

  return {
    ...response,
    forms: data,
  };
};
