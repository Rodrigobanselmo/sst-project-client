import { useMutation } from 'react-query';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { QueryEnum } from 'core/enums/query.enums';
import { api } from 'core/services/apiClient';
import { queryClient } from 'core/services/queryClient';

export interface IResetOfficialSeries {
  companyId: string;
  documentDataId: string;
}

const resetOfficialSeries = async ({
  companyId,
  documentDataId,
}: IResetOfficialSeries) => {
  const response = await api.post<{
    previousOfficialRevisionSeries: number;
    officialRevisionSeries: number;
  }>(
    ApiRoutesEnum.DOCUMENT_DATA_RESET_OFFICIAL.replace(
      ':companyId',
      companyId,
    ).replace(':documentDataId', documentDataId),
  );

  return response.data;
};

export function useMutResetOfficialSeries() {
  return useMutation(resetOfficialSeries, {
    onSuccess: async () => {
      await queryClient.refetchQueries([QueryEnum.DOCUMENT_DATA]);
      queryClient.invalidateQueries([QueryEnum.DOCUMENT_VERSION]);
    },
  });
}
