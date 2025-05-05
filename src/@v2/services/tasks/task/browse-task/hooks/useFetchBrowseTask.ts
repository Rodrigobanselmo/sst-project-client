import { QueryKeyTaskEnum } from '@v2/constants/enums/task-query-key.enum';
import { useFetch } from '@v2/hooks/api/useFetch';
import { browseTask, BrowseTaskParams } from '../service/browse-task.service';

export const getKeyBrowseTask = (params: BrowseTaskParams) => {
  return [QueryKeyTaskEnum.TASK, params.companyId, params];
};

export const useFetchBrowseTask = (params: BrowseTaskParams) => {
  const { data, ...response } = useFetch({
    queryFn: async () => {
      return browseTask(params);
    },
    queryKey: getKeyBrowseTask(params),
  });

  return {
    ...response,
    task: data,
  };
};
