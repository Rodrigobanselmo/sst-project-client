import { useMutation } from 'react-query';

import { useSnackbar } from 'notistack';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { QueryEnum } from 'core/enums/query.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { IExamToRisk } from 'core/interfaces/api/IExam';
import { api } from 'core/services/apiClient';
import { queryClient } from 'core/services/queryClient';

import { IErrorResp } from '../../../../../errors/types';

export interface IUpdateExamRisk {
  id?: number;
  examId?: number;
  riskId?: string;
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

export async function updateExam(data: IUpdateExamRisk, companyId?: string) {
  if (!companyId) return null;

  const response = await api.patch<IExamToRisk>(
    `${ApiRoutesEnum.EXAM_RISK}/${data.id}/${companyId}`,
    {
      ...data,
      companyId,
    },
  );

  return response.data;
}

export function useMutUpdateExamRisk() {
  const { getCompanyId } = useGetCompanyId();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation(
    async (data: IUpdateExamRisk) =>
      updateExam(data, getCompanyId(data.companyId)),
    {
      onSuccess: async (newExam) => {
        if (newExam) {
          queryClient.invalidateQueries([QueryEnum.EXAMS_RISK]);
        }

        enqueueSnackbar('Editado com sucesso', {
          variant: 'success',
        });
        return newExam;
      },
      onError: (error: IErrorResp) => {
        if (error.response.status == 400)
          enqueueSnackbar('Você não tem permissão para editar esse dado', {
            variant: 'error',
          });
        else {
          enqueueSnackbar(error.response.data.message, { variant: 'error' });
        }
      },
    },
  );
}
