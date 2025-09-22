import { QueryKeyFormEnum } from '@v2/constants/enums/form-query-key.enum';
import { useFetch } from '@v2/hooks/api/useFetch';
import { useInfiniteFetch } from '@v2/hooks/api/useInfiniteFetch';
import { QueryKeyEnum } from '@v2/constants/enums/@query-key.enum';
import { browseFormParticipants } from '../service/browse-form-participants.service';
import { BrowseFormParticipantsParams } from '../service/browse-form-participants.types';

export const getKeyBrowseFormParticipants = (
  params: BrowseFormParticipantsParams,
) => {
  return [
    QueryKeyFormEnum.FORM_PARTICIPANTS,
    params.companyId,
    params.applicationId,
    params,
  ];
};

export const useFetchBrowseFormParticipants = (
  params: BrowseFormParticipantsParams,
) => {
  const { data, ...response } = useFetch({
    queryFn: async () => {
      return browseFormParticipants(params);
    },
    queryKey: getKeyBrowseFormParticipants(params),
    enabled: !!params.companyId && !!params.applicationId,
  });

  return {
    ...response,
    formParticipants: data,
  };
};

export const useInfinityFetchBrowseFormParticipants = (
  params: BrowseFormParticipantsParams,
) => {
  const { data, ...response } = useInfiniteFetch({
    queryFn: async ({ page }) => {
      return browseFormParticipants({
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
    queryKey: [...getKeyBrowseFormParticipants(params), QueryKeyEnum.INFINITE],
    enabled: !!params.companyId && !!params.applicationId,
  });

  return {
    ...response,
    formParticipants: data,
  };
};
