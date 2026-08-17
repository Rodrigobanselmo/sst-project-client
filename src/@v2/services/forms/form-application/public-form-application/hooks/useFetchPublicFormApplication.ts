import { useFetch } from '@v2/hooks/api/useFetch';
import {
  publicFormApplication,
  PublicFormApplicationParams,
} from '../service/public-form-application.service';
import { getPublicFormApplicationQueryKey } from './get-public-form-application-query-key';

export const useFetchPublicFormApplication = (
  params: PublicFormApplicationParams,
) => {
  const { data, ...response } = useFetch({
    queryFn: async () => {
      return publicFormApplication(params);
    },
    queryKey: getPublicFormApplicationQueryKey(
      params.applicationId,
      params.encrypt,
    ),
    refetchOnMount: true,
  });

  return {
    ...response,
    hierarchyId: data?.hierarchyId,
    employeeId: data?.employeeId,
    publicFormApplication: data?.data,
    isTesting: !!data?.isTesting,
    isPublic: !!data?.isPublic,
    hasAlreadyAnswered: !!data?.hasAlreadyAnswered,
    options: data?.options ?? {
      hierarchies: [],
    },
  };
};
