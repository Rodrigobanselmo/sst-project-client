import { useMutation } from 'react-query';

import { useRouter } from 'next/router';
import { useSnackbar } from 'notistack';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { QueryEnum } from 'core/enums/query.enums';
import { IHierarchy } from 'core/interfaces/api/IHierarchy';
import { api } from 'core/services/apiClient';
import { queryClient } from 'core/services/queryClient';

import { useAuth } from '../../../../../contexts/AuthContext';
import { IErrorResp } from '../../../../errors/types';

export async function createHierarchy(id: string, companyId?: string) {
  if (!companyId) return;

  const response = await api.delete<IHierarchy>(
    `${ApiRoutesEnum.HIERARCHY}/${id}/${companyId}`,
  );

  return response.data;
}

export function useMutDeleteHierarchy() {
  const { user } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const router = useRouter();

  const company =
    (user && ((router.query.companyId as string) || user?.companyId)) ||
    undefined;

  return useMutation(async (id: string) => createHierarchy(id, company), {
    onSuccess: async (resp) => {
      if (!company) {
        enqueueSnackbar('ID da empresa não encontrado', {
          variant: 'error',
        });

        return;
      }

      if (resp) {
        queryClient.setQueryData(
          [QueryEnum.HIERARCHY, resp.companyId],
          (oldData: IHierarchy[] | undefined) =>
            oldData ? oldData.filter((data) => data.id !== resp.id) : [],
        );
      }

      enqueueSnackbar('Hierarquia deletado com sucesso', {
        variant: 'success',
      });

      return resp;
    },
    onError: (error: IErrorResp) => {
      if (error.response.data.message.includes('fkey'))
        enqueueSnackbar(
          'Proibido deletar hierarquia quando ligada a um empregado',
          { variant: 'error' },
        );
      else enqueueSnackbar(error.response.data.message, { variant: 'error' });
    },
  });
}
