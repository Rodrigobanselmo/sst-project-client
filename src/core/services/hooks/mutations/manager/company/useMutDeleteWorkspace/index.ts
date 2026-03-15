import { useMutation } from 'react-query';

import { useSnackbar } from 'notistack';

import { QueryEnum } from 'core/enums/query.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { api } from 'core/services/apiClient';
import { queryClient } from 'core/services/queryClient';

import { IErrorResp } from '../../../../../errors/types';

export interface IDeleteWorkspace {
  workspaceId: string;
  companyId?: string;
}

export async function deleteWorkspace(
  { workspaceId, companyId }: IDeleteWorkspace,
  companyIdFromHook: string,
) {
  const resolvedCompanyId = companyId ?? companyIdFromHook;
  const path = `v2/companies/${resolvedCompanyId}/workspaces/${workspaceId}`;
  const response = await api.delete(path);
  return response.data;
}

export function useMutDeleteWorkspace() {
  const { enqueueSnackbar } = useSnackbar();
  const { user, getCompanyId } = useGetCompanyId();

  return useMutation(
    (data: IDeleteWorkspace) => deleteWorkspace(data, getCompanyId(data)),
    {
    onSuccess: async () => {
      queryClient.invalidateQueries([QueryEnum.COMPANIES, user?.companyId]);
      queryClient.invalidateQueries([QueryEnum.COMPANY]);

      enqueueSnackbar('Estabelecimento excluído com sucesso', {
        variant: 'success',
      });
    },
    onError: (error: IErrorResp) => {
      enqueueSnackbar(
        error?.response?.data?.message ?? 'Erro ao excluir estabelecimento',
        { variant: 'error' },
      );
    },
  },
  );
}
