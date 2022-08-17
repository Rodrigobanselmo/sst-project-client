import { useMutation } from 'react-query';

import { useSnackbar } from 'notistack';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { QueryEnum } from 'core/enums/query.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { IExam, IExamToRisk } from 'core/interfaces/api/IExam';
import { api } from 'core/services/apiClient';
import { queryClient } from 'core/services/queryClient';

import { IErrorResp } from '../../../../../errors/types';

export interface ICreateExamRisk {
  examId: number;
  riskId: string;
  companyId?: string;
  isMale?: boolean;
  isFemale?: boolean;
  isPeriodic?: boolean;
  isChange?: boolean;
  isAdmission?: boolean;
  isReturn?: boolean;
  isDismissal?: boolean;
  validityInMonths?: number;
  lowValidityInMonths?: number;
  fromAge?: number;
  toAge?: number;
  startDate?: Date;
  endDate?: Date;
}

export async function createExam(data: ICreateExamRisk, companyId?: string) {
  if (!companyId) return null;

  const response = await api.post<IExamToRisk>(`${ApiRoutesEnum.EXAM_RISK}`, {
    ...data,
    companyId,
  });

  return response.data;
}

export function useMutCreateExamRisk() {
  const { enqueueSnackbar } = useSnackbar();
  const { getCompanyId } = useGetCompanyId();

  return useMutation(
    async (data: ICreateExamRisk) =>
      createExam(data, getCompanyId(data.companyId)),
    {
      onSuccess: async (newExam) => {
        if (newExam) {
          queryClient.invalidateQueries([QueryEnum.EXAMS_RISK]);
        }

        enqueueSnackbar('Exame vinculado ao risco com sucesso', {
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
