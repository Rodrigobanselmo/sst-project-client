import { QueryKeyFormEnum } from '@v2/constants/enums/form-query-key.enum';
import { useFetch } from '@v2/hooks/api/useFetch';
import {
  publicFormApplication,
  PublicFormApplicationParams,
} from '../service/public-form-application.service';

export const useFetchPublicFormApplication = (
  params: PublicFormApplicationParams,
) => {
  const { data, ...response } = useFetch({
    queryFn: async () => {
      return publicFormApplication(params);
    },
    queryKey: [QueryKeyFormEnum.PUBLIC_FORM_APPLICATION, params.applicationId],
  });

  return {
    ...response,
    publicFormApplication: data?.data,
    isTesting: data?.isTesting,
    isPublic: data?.isPublic,
  };
};
