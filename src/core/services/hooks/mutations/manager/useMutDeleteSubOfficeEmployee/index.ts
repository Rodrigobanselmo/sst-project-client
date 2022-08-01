import { useMutation } from 'react-query';

import { useSnackbar } from 'notistack';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { QueryEnum } from 'core/enums/query.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { IEmployee } from 'core/interfaces/api/IEmployee';
import { api } from 'core/services/apiClient';
import { queryClient } from 'core/services/queryClient';

import { IErrorResp } from '../../../../errors/types';

export interface IDeleteSubOfficeEmployee {
  employeeId: number;
  subOfficeId: string;
  companyId?: string;
}

export async function deleteSubOfficeEmployee(
  data: IDeleteSubOfficeEmployee,
  companyId?: string,
) {
  if (!companyId) return null;

  const response = await api.post<IEmployee>(
    ApiRoutesEnum.EMPLOYEES_DELETE_SUB_OFFICE.replace(
      ':employeeId',
      String(data.employeeId),
    )
      .replace(':subOfficeId', data.subOfficeId)
      .replace(':companyId', companyId),
    {},
  );

  return response.data;
}

export function useMutDeleteSubOfficeEmployee() {
  const { getCompanyId } = useGetCompanyId();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation(
    async (data: IDeleteSubOfficeEmployee) =>
      deleteSubOfficeEmployee(data, getCompanyId(data)),
    {
      onSuccess: async (resp) => {
        if (resp) queryClient.invalidateQueries([QueryEnum.EMPLOYEES]);

        enqueueSnackbar('Empregado removido com sucesso', {
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
