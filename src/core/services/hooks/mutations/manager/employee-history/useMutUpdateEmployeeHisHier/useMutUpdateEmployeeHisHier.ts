import { useMutation } from 'react-query';

import { useSnackbar } from 'notistack';
import { EmployeeHierarchyMotiveTypeEnum } from 'project/enum/employee-hierarchy-motive.enum';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { QueryEnum } from 'core/enums/query.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { IEmployeeHierarchyHistory } from 'core/interfaces/api/IEmployee';
import { api } from 'core/services/apiClient';
import { queryClient } from 'core/services/queryClient';

import { IErrorResp } from '../../../../../errors/types';

export interface IUpdateEmployeeHierarchyHistory {
  id?: number;
  motive?: EmployeeHierarchyMotiveTypeEnum;
  startDate?: string;
  hierarchyId?: string;
  employeeId?: number;
  companyId?: string;
}

export async function update(
  data: IUpdateEmployeeHierarchyHistory,
  companyId?: string,
) {
  if (!companyId) return null;

  const response = await api.patch<IEmployeeHierarchyHistory>(
    ApiRoutesEnum.EMPLOYEE_HISTORY_HIER + '/' + data.id + '/' + companyId,
    {
      ...data,
      companyId,
    },
  );

  return response.data;
}

export function useMutUpdateEmployeeHisHier() {
  const { getCompanyId } = useGetCompanyId();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation(
    async (data: IUpdateEmployeeHierarchyHistory) =>
      update(data, getCompanyId(data)),
    {
      onSuccess: async (resp) => {
        if (resp) {
          queryClient.invalidateQueries([QueryEnum.EMPLOYEE_HISTORY_HIER]);
          queryClient.invalidateQueries([QueryEnum.EMPLOYEES]);
        }

        enqueueSnackbar('Historico editado com sucesso', {
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
