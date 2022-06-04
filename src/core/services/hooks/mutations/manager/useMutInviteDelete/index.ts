import { useMutation } from 'react-query';

import { useSnackbar } from 'notistack';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { QueryEnum } from 'core/enums/query.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { IInvites } from 'core/interfaces/api/IInvites';
import { api } from 'core/services/apiClient';
import { queryClient } from 'core/services/queryClient';

import { IErrorResp } from '../../../../errors/types';

export async function deleteInvite(id: string, companyId?: string) {
  if (!companyId) return null;

  const response = await api.delete<string>(
    `${ApiRoutesEnum.INVITES}/${id}/${companyId}`,
  );
  return response.data;
}

export function useMutInviteDelete() {
  const { enqueueSnackbar } = useSnackbar();
  const { companyId } = useGetCompanyId();

  return useMutation(async (id: string) => deleteInvite(id, companyId), {
    onSuccess: async (resp) => {
      if (resp)
        queryClient.setQueryData(
          [QueryEnum.INVITES, companyId],
          (oldData: IInvites[] | undefined) =>
            oldData ? [...oldData].filter((data) => data.id !== resp) : [],
        );

      enqueueSnackbar('Convite deletado com sucesso', {
        variant: 'success',
      });
      return resp;
    },
    onError: (error: IErrorResp) => {
      enqueueSnackbar(error.response.data.message, { variant: 'error' });
    },
  });
}
