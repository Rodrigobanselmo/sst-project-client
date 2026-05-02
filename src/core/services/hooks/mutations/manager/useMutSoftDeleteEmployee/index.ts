import { useMutation } from 'react-query';

import { useSnackbar } from 'notistack';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { QueryEnum } from 'core/enums/query.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { api } from 'core/services/apiClient';
import { queryClient } from 'core/services/queryClient';

import { IErrorResp } from '../../../../errors/types';

export async function softDeleteEmployee(employeeId: number, companyId: string) {
  const url = ApiRoutesEnum.EMPLOYEE_SOFT_DELETE.replace(
    ':companyId',
    encodeURIComponent(companyId),
  ).replace(':employeeId', String(employeeId));
  const response = await api.patch<{ ok: boolean }>(url);
  return response.data;
}

export function useMutSoftDeleteEmployee() {
  const { enqueueSnackbar } = useSnackbar();
  const { companyId: workspaceCompanyId } = useGetCompanyId();

  return useMutation(
    (employeeId: number) => {
      if (!workspaceCompanyId) {
        return Promise.reject(new Error('Empresa da rota não encontrada para exclusão.'));
      }
      return softDeleteEmployee(employeeId, workspaceCompanyId);
    },
    {
      onSuccess: async () => {
        await queryClient.invalidateQueries([QueryEnum.EMPLOYEES]);
        enqueueSnackbar('Funcionário removido da listagem com sucesso.', {
          variant: 'success',
        });
      },
      onError: (error: IErrorResp) => {
        if (error.response?.data?.message) {
          enqueueSnackbar(error.response.data.message, { variant: 'error' });
        } else {
          enqueueSnackbar('Não foi possível excluir o funcionário.', {
            variant: 'error',
          });
        }
      },
    },
  );
}
