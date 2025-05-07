import { QueryKeyAuthEnum } from '@v2/constants/enums/auth-query-key.enum';
import { QueryKeyTaskEnum } from '@v2/constants/enums/task-query-key.enum';
import { useFetch } from '@v2/hooks/api/useFetch';
import { browseTaskResponsible } from '../service/browse-task-responsible.service';
import { BrowseTaskResponsibleParams } from '../service/browse-task-responsible.types';

export const useFetchBrowseTaskResponsible = (
  params: BrowseTaskResponsibleParams,
) => {
  const { data, ...response } = useFetch({
    queryFn: async () => {
      return browseTaskResponsible(params);
    },
    queryKey: [
      QueryKeyAuthEnum.USERS,
      params.companyId,
      QueryKeyTaskEnum.TASK_RESPONSIBLE,
      params,
    ],
  });

  return {
    ...response,
    responsible: data,
  };
};
