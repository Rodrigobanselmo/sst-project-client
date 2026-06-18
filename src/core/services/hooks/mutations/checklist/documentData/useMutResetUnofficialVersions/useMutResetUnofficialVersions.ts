import { useMutation } from 'react-query';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { QueryEnum } from 'core/enums/query.enums';
import { api } from 'core/services/apiClient';
import { queryClient } from 'core/services/queryClient';

export interface IResetUnofficialVersions {
  companyId: string;
  documentDataId: string;
}

const resetUnofficialVersions = async ({
  companyId,
  documentDataId,
}: IResetUnofficialVersions) => {
  const response = await api.post<{ deletedCount: number }>(
    ApiRoutesEnum.DOCUMENT_DATA_RESET_UNOFFICIAL.replace(
      ':companyId',
      companyId,
    ).replace(':documentDataId', documentDataId),
  );

  return response.data;
};

export function useMutResetUnofficialVersions() {
  return useMutation(resetUnofficialVersions, {
    onSuccess: () => {
      queryClient.invalidateQueries([QueryEnum.DOCUMENT_VERSION]);
      queryClient.invalidateQueries([QueryEnum.DOCUMENT_DATA]);
    },
  });
}
