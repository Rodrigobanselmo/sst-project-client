import { QueryKeyActionPlanEnum } from '@v2/constants/enums/action-plan-query-key.enum';
import { useFetch } from '@v2/hooks/api/useFetch';
import { browseOperationalActionSuggestions } from '../service/operational-action-group.service';
import { BrowseOperationalActionSuggestionsParams } from '../service/operational-action-group.types';

export const useFetchOperationalActionSuggestions = (
  params: BrowseOperationalActionSuggestionsParams & { enabled?: boolean },
) => {
  const { enabled = true, ...query } = params;

  return useFetch({
    enabled,
    queryFn: () => browseOperationalActionSuggestions(query),
    queryKey: [
      QueryKeyActionPlanEnum.ACTION_OPERATIONAL_SUGGESTIONS,
      query.companyId,
      query.workspaceId,
    ],
  });
};
