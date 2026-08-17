import { QueryKeyFormEnum } from '@v2/constants/enums/form-query-key.enum';
import { useFetch } from '@v2/hooks/api/useFetch';
import {
  readClosingPrecheck,
  ReadClosingPrecheckParams,
} from '../service/read-closing-precheck.service';

export const useFetchClosingPrecheck = (
  params: ReadClosingPrecheckParams,
  options?: { enabled?: boolean },
) => {
  const { data, ...response } = useFetch({
    queryFn: async () => readClosingPrecheck(params),
    queryKey: [
      QueryKeyFormEnum.FORM_CLOSING_PRECHECK,
      params.companyId,
      params.applicationId,
    ],
    enabled: options?.enabled,
  });

  return {
    ...response,
    precheck: data,
  };
};
