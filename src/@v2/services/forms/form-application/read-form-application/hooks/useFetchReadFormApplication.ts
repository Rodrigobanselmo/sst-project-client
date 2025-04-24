import { QueryKeyFormEnum } from '@v2/constants/enums/form-query-key.enum';
import { useFetch } from '@v2/hooks/api/useFetch';
import {
  readFormApplication,
  ReadFormApplicationParams,
} from '../service/read-form-application.service';

export const useFetchReadFormApplication = (
  params: ReadFormApplicationParams,
) => {
  const { data, ...response } = useFetch({
    queryFn: async () => {
      return readFormApplication(params);
    },
    queryKey: [
      QueryKeyFormEnum.FORM_APPLICATION,
      params.companyId,
      params.applicationId,
    ],
  });

  return {
    ...response,
    formApplication: data,
  };
};
