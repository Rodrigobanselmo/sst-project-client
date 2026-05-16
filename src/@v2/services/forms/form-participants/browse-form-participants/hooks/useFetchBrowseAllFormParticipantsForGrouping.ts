import { QueryKeyFormEnum } from '@v2/constants/enums/form-query-key.enum';
import { useFetch } from '@v2/hooks/api/useFetch';
import {
  browseAllFilteredFormParticipants,
  FORM_PARTICIPANTS_GROUPED_FETCH_CAP,
} from '../service/browse-all-filtered-form-participants';
import { BrowseFormParticipantsParams } from '../service/browse-form-participants.types';

export type UseFetchBrowseAllFormParticipantsForGroupingParams = Omit<
  BrowseFormParticipantsParams,
  'pagination'
> & {
  enabled?: boolean;
};

export const getKeyBrowseAllFormParticipantsForGrouping = (
  params: Omit<BrowseFormParticipantsParams, 'pagination'>,
) => {
  return [
    QueryKeyFormEnum.FORM_PARTICIPANTS,
    'grouped-all-v2',
    params.companyId,
    params.applicationId,
    params.filters,
    params.orderBy,
  ];
};

export const useFetchBrowseAllFormParticipantsForGrouping = (
  params: UseFetchBrowseAllFormParticipantsForGroupingParams,
) => {
  const { enabled = true, ...rest } = params;
  const { data, isFetching, ...response } = useFetch({
    queryFn: async () => {
      return browseAllFilteredFormParticipants({
        ...rest,
        maxRows: FORM_PARTICIPANTS_GROUPED_FETCH_CAP,
      });
    },
    queryKey: getKeyBrowseAllFormParticipantsForGrouping(rest),
    enabled: !!rest.companyId && !!rest.applicationId && enabled,
    refetchOnMount: true,
  });

  return {
    ...response,
    isFetching,
    formParticipants: data,
  };
};
