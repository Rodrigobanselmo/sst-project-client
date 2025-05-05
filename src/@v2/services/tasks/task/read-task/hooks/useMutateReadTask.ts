import { QueryKeyTaskEnum } from '@v2/constants/enums/task-query-key.enum';
import { useFetch } from '@v2/hooks/api/useFetch';
import { readTask, ReadTaskParams } from '../service/read-task-task.service';

export const getKeyReadTask = (params: ReadTaskParams) => {
  return [QueryKeyTaskEnum.TASK, params.companyId, params.id];
};

export const useFetchReadTask = (params: ReadTaskParams) => {
  const { data, ...response } = useFetch({
    queryFn: async () => {
      return readTask(params);
    },
    queryKey: getKeyReadTask(params),
  });

  return {
    ...response,
    task: data,
  };
};
