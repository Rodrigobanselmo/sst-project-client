import { useMutation } from 'react-query';

import { useSnackbar } from 'notistack';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { QueryEnum } from 'core/enums/query.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { IEmployeeHierarchyHistory } from 'core/interfaces/api/IEmployee';
import { api } from 'core/services/apiClient';
import { queryClient } from 'core/services/queryClient';

import { IErrorResp } from '../../../../../errors/types';

export interface IDelete {
  id?: number;
  employeeId?: number;
  companyId?: string;
}

export async function deleteQuery(data: IDelete, companyId?: string) {
  if (!companyId) return null;

  const response = await api.delete<IEmployeeHierarchyHistory>(
    ApiRoutesEnum.EMPLOYEE_HISTORY_EXAM +
      '/' +
      data.employeeId +
      '/' +
      data.id +
      '/' +
      companyId,
  );

  return response.data;
}

export function useMutDeleteEmployeeHisExam() {
  const { getCompanyId } = useGetCompanyId();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation(
    async (data: IDelete) => deleteQuery(data, getCompanyId(data)),
    {
      onSuccess: async (resp) => {
        if (resp) {
          queryClient.invalidateQueries([QueryEnum.EMPLOYEE_HISTORY_EXAM]);
          queryClient.invalidateQueries([QueryEnum.EMPLOYEES]);
        }

        enqueueSnackbar('Exame deletada com sucesso', {
          variant: 'success',
        });
        return resp;
      },
      onError: (error: IErrorResp) => {
        if (error.response?.data)
          enqueueSnackbar(error.response.data.message, { variant: 'error' });
      },
    },
  );
}
