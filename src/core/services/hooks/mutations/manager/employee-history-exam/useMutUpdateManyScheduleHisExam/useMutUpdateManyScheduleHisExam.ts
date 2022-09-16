import { useMutation } from 'react-query';

import { useSnackbar } from 'notistack';
import { SexTypeEnum } from 'project/enum/sex.enums';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { QueryEnum } from 'core/enums/query.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { IEmployeeExamsHistory } from 'core/interfaces/api/IEmployee';
import { api } from 'core/services/apiClient';
import { queryClient } from 'core/services/queryClient';

import { IErrorResp } from '../../../../../errors/types';
import { IUpdateEmployeeExamHistory } from '../useMutUpdateEmployeeHisExam/useMutUpdateEmployeeHisExam';

export interface IUpdateManyScheduleExamHistory {
  data: IUpdateEmployeeExamHistory[];
  companyId?: string;
  phone?: string;
  cpf?: string;
  email?: string;
  name?: string;
  birthday?: Date;
  isClinic?: boolean;
  sex?: SexTypeEnum;
}

export async function update(
  data: IUpdateManyScheduleExamHistory,
  companyId?: string,
) {
  if (!companyId) return null;

  const response = await api.post<IEmployeeExamsHistory[]>(
    ApiRoutesEnum.EMPLOYEE_HISTORY_EXAM +
      '/update-many-schedule' +
      '/' +
      companyId,
    {
      ...data,
      companyId,
    },
  );

  return response.data;
}

export function useMutUpdateManyScheduleHisExam() {
  const { getCompanyId } = useGetCompanyId();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation(
    async (data: IUpdateManyScheduleExamHistory) =>
      update(data, getCompanyId(data)),
    {
      onSuccess: async (resp) => {
        if (resp) {
          queryClient.invalidateQueries([QueryEnum.EMPLOYEE_HISTORY_EXAM]);
          queryClient.invalidateQueries([QueryEnum.EMPLOYEES]);
        }

        enqueueSnackbar('Exame editado com sucesso', {
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
