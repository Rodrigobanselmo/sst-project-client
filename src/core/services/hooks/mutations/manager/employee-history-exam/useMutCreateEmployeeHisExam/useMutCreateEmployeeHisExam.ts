import { useMutation } from 'react-query';

import { useSnackbar } from 'notistack';
import { ExamHistoryConclusionEnum } from 'project/enum/employee-exam-history-conclusion.enum';
import { ExamHistoryEvaluationEnum } from 'project/enum/employee-exam-history-evaluation.enum';
import { ExamHistoryTypeEnum } from 'project/enum/employee-exam-history-type.enum';
import { StatusEnum } from 'project/enum/status.enum';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { QueryEnum } from 'core/enums/query.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { IEmployeeHierarchyHistory } from 'core/interfaces/api/IEmployee';
import { ClinicScheduleTypeEnum } from 'core/interfaces/api/IExam';
import { api } from 'core/services/apiClient';
import { queryClient } from 'core/services/queryClient';

import { IErrorResp } from '../../../../../errors/types';

export interface ICreateEmployeeExamHistory {
  examId?: number;
  employeeId: number;
  time: string;
  companyId: string;
  validityInMonths: number;
  obs?: string;
  doctorId?: number;
  clinicId?: string;
  doneDate: Date;
  examType: ExamHistoryTypeEnum;
  evaluationType?: ExamHistoryEvaluationEnum;
  conclusion?: ExamHistoryConclusionEnum;
  status?: StatusEnum;
  hierarchyId?: string;
  clinicObs?: string;
  scheduleType?: ClinicScheduleTypeEnum;
  changeHierarchyDate?: Date;
  changeHierarchyAnyway?: boolean;
  examsData?: {
    examId: number;
    validityInMonths?: number;
    clinicId?: string;
    time?: string;
    clinicObs?: string;
    doneDate?: Date;
    status?: StatusEnum;
    scheduleType?: ClinicScheduleTypeEnum;
  }[];
}

export async function create(
  data: ICreateEmployeeExamHistory,
  companyId?: string,
) {
  if (!companyId) return null;

  const response = await api.post<IEmployeeHierarchyHistory>(
    ApiRoutesEnum.EMPLOYEE_HISTORY_EXAM + '/' + companyId,
    {
      ...data,
      companyId,
    },
  );

  return response.data;
}

export function useMutCreateEmployeeHisExam() {
  const { getCompanyId } = useGetCompanyId();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation(
    async (data: ICreateEmployeeExamHistory) =>
      create(data, getCompanyId(data)),
    {
      onSuccess: async (resp) => {
        if (resp) {
          queryClient.invalidateQueries([QueryEnum.EMPLOYEE_HISTORY_EXAM]);
          // queryClient.invalidateQueries([QueryEnum.EMPLOYEES]);
        }

        enqueueSnackbar('Exame criado com sucesso', {
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
