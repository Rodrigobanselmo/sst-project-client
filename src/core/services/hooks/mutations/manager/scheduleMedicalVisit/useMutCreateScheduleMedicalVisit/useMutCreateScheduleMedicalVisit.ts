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
import { ICreateEmployeeExamHistory } from '../../employee-history-exam/useMutCreateEmployeeHisExam/useMutCreateEmployeeHisExam';
import { IScheduleMedicalVisit } from 'core/interfaces/api/IScheduleMedicalVisit';

export interface ICreateScheduleMedicalExam {
  doneClinicDate: Date;
  doneLabDate?: Date;
  companyId: string;
  clinicId?: string;
  labId?: string;
  docId?: number;
  status: StatusEnum;
  readonly exams?: ICreateEmployeeExamHistory[];
}

export async function create(
  data: ICreateScheduleMedicalExam,
  companyId?: string,
) {
  if (!companyId) return null;

  const response = await api.post<IScheduleMedicalVisit>(
    ApiRoutesEnum.SCHEDULE_MEDICAL_VISIT.replace(':companyId', companyId),
    {
      ...data,
      companyId,
    },
  );

  return response.data;
}

export function useMutCreateScheduleMedicalVisit() {
  const { getCompanyId } = useGetCompanyId();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation(
    async (data: ICreateScheduleMedicalExam) =>
      create(data, getCompanyId(data)),
    {
      onSuccess: async (resp) => {
        if (resp) {
          queryClient.invalidateQueries([QueryEnum.SCHEDULE_MEDICAL_VISIT]);
          queryClient.invalidateQueries([QueryEnum.EMPLOYEES]);
        }

        enqueueSnackbar('Visita médica criada com sucesso', {
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
