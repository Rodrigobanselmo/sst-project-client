import { useFetch } from '@v2/hooks/api/useFetch';
import { BrowseGenerateSourcesParams } from '../service/browse-generate-sources.types';
import { browseGenerateSources } from '../service/browse-generate-sources.service';
import { QueryKeyActionPlanEnum } from '@v2/constants/enums/action-plan-query-key.enum';

export const useFetchBrowseGenerateSources = (
  params: BrowseGenerateSourcesParams,
) => {
  const { data, ...response } = useFetch({
    queryFn: async () => {
      return browseGenerateSources(params);
    },
    queryKey: [
      QueryKeyActionPlanEnum.ACTION_PLAN_GENERATE_SOURCES,
      params.companyId,
      params,
    ],
  });

  return {
    ...response,
    generateSources: data,
  };
};
