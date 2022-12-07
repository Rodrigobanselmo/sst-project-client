import { useMutation } from 'react-query';

import { useSnackbar } from 'notistack';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { QueryEnum } from 'core/enums/query.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { api } from 'core/services/apiClient';
import { queryClient } from 'core/services/queryClient';

import { IErrorResp } from '../../../../../errors/types';

export async function copyCompanyOS(
  copyFromCompanyId: string,
  companyId?: string,
) {
  if (!companyId) return null;

  const response = await api.post(
    `${ApiRoutesEnum.OS}/copy`.replace(':companyId', companyId),
    {
      companyId,
      copyFromCompanyId,
    },
  );
  return response.data;
}

export function useMutCopyOs() {
  const { getCompanyId } = useGetCompanyId();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation(
    async ({
      copyFromCompanyId,
      companyId,
    }: {
      copyFromCompanyId: string;
      companyId?: string;
    }) => copyCompanyOS(copyFromCompanyId, getCompanyId(companyId)),
    {
      onSuccess: async () => {
        queryClient.invalidateQueries([QueryEnum.OS]);

        enqueueSnackbar('Empresa copiada com sucesso', {
          variant: 'success',
        });
      },
      onError: (error: IErrorResp) => {
        enqueueSnackbar(error.response.data.message, { variant: 'error' });
      },
    },
  );
}
