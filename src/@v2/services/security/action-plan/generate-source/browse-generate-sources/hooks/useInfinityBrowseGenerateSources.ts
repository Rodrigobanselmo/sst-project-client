import { useInfiniteFetch } from '@v2/hooks/api/useInfiniteFetch';
import { BrowseGenerateSourcesParams } from '../service/browse-generate-sources.types';
import { browseGenerateSources } from '../service/browse-generate-sources.service';
import { QueryKeyActionPlanEnum } from '@v2/constants/enums/action-plan-query-key.enum';
import { QueryKeyEnum } from '@v2/constants/enums/@query-key.enum';

export const useInfinityBrowseGenerateSources = (
  params: BrowseGenerateSourcesParams,
) => {
  const { data, ...response } = useInfiniteFetch({
    queryFn: async ({ page }) => {
      return browseGenerateSources({
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
      QueryKeyActionPlanEnum.ACTION_PLAN_GENERATE_SOURCES,
      params.companyId,
      params,
      QueryKeyEnum.INFINITE,
    ],
  });

  return {
    ...response,
    generateSources: data,
  };
};
