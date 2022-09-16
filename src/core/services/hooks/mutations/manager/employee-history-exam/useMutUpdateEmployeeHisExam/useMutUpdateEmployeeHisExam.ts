import { useMutation } from 'react-query';

import { useSnackbar } from 'notistack';
import { ExamHistoryConclusionEnum } from 'project/enum/employee-exam-history-conclusion.enum';
import { ExamHistoryEvaluationEnum } from 'project/enum/employee-exam-history-evaluation.enum';
import { ExamHistoryTypeEnum } from 'project/enum/employee-exam-history-type.enum';
import { StatusEnum } from 'project/enum/status.enum';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { QueryEnum } from 'core/enums/query.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { IEmployeeExamsHistory } from 'core/interfaces/api/IEmployee';
import { ClinicScheduleTypeEnum } from 'core/interfaces/api/IExam';
import { api } from 'core/services/apiClient';
import { queryClient } from 'core/services/queryClient';

import { IErrorResp } from '../../../../../errors/types';

export interface IUpdateEmployeeExamHistory {
  id: number;
  examId?: number;
  employeeId: number;
  time?: string;
  obs?: string;
  validityInMonths?: number;
  doctorId?: number;
  scheduleType?: ClinicScheduleTypeEnum;
  clinicId?: string;
  doneDate?: Date;
  examType?: ExamHistoryTypeEnum;
  evaluationType?: ExamHistoryEvaluationEnum;
  conclusion?: ExamHistoryConclusionEnum;
  status?: StatusEnum;
}

export async function update(
  data: IUpdateEmployeeExamHistory,
  companyId?: string,
) {
  if (!companyId) return null;

  const response = await api.patch<IEmployeeExamsHistory>(
    ApiRoutesEnum.EMPLOYEE_HISTORY_EXAM + '/' + data.id + '/' + companyId,
    {
      ...data,
      companyId,
    },
  );

  return response.data;
}

export function useMutUpdateEmployeeHisExam() {
  const { getCompanyId } = useGetCompanyId();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation(
    async (data: IUpdateEmployeeExamHistory) =>
      update(data, getCompanyId(data)),
    {
      onSuccess: async (resp) => {
        if (resp) {
          queryClient.invalidateQueries([QueryEnum.EMPLOYEE_HISTORY_EXAM]);
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
