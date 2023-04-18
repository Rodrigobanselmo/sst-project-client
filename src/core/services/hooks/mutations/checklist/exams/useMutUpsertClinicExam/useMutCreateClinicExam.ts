import { useMutation } from 'react-query';

import { useSnackbar } from 'notistack';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { QueryEnum } from 'core/enums/query.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { ClinicScheduleTypeEnum, IExam } from 'core/interfaces/api/IExam';
import { api } from 'core/services/apiClient';
import { queryClient } from 'core/services/queryClient';

import { IErrorResp } from '../../../../../errors/types';

export interface ICreateClinicExam {
  examId: number;
  companyId: string;
  groupId?: string;
  startDate: Date;
  dueInDays?: number;
  price?: number;
  isScheduled?: boolean;
  observation?: string;
  isPeriodic?: boolean;
  isChange?: boolean;
  isAdmission?: boolean;
  isReturn?: boolean;
  isDismissal?: boolean;
  status?: string;
  scheduleRange?: any;
  examMinDuration?: string;
  scheduleType?: ClinicScheduleTypeEnum;
}

export async function createExam(data: ICreateClinicExam, companyId?: string) {
  if (!companyId) return null;

  const response = await api.post<IExam>(`${ApiRoutesEnum.CLINIC_EXAM}`, {
    ...data,
    companyId,
  });

  return response.data;
}

export function useMutUpsertClinicExam() {
  const { enqueueSnackbar } = useSnackbar();
  const { companyId } = useGetCompanyId();

  return useMutation(
    async (data: ICreateClinicExam) =>
      createExam(data, data.companyId || companyId),
    {
      onSuccess: async (newExam) => {
        if (newExam) {
          queryClient.invalidateQueries([QueryEnum.CLINIC_EXAMS]);
        }

        enqueueSnackbar('Exames inseridos com sucesso', {
          variant: 'success',
        });
        return newExam;
      },
      onError: (error: IErrorResp) => {
        enqueueSnackbar(error.response.data.message, { variant: 'error' });
      },
    },
  );
}
