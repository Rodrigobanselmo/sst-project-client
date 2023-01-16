import { useMutation } from 'react-query';

import { useSnackbar } from 'notistack';
import { StatusEnum } from 'project/enum/status.enum';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { QueryEnum } from 'core/enums/query.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { ExamTypeEnum, IExam } from 'core/interfaces/api/IExam';
import { IRiskFactors } from 'core/interfaces/api/IRiskFactors';
import { api } from 'core/services/apiClient';
import { queryClient } from 'core/services/queryClient';

import { IErrorResp } from '../../../../../errors/types';

export interface ICreateExam {
  name: string;
  companyId: string;
  status?: StatusEnum;
  instruction?: string;
  material?: string;
  isAttendance?: boolean;
  isAvaliation?: boolean;
  type?: ExamTypeEnum;
  analyses?: string;
  esocial27Code?: string;
}

export async function createExam(data: ICreateExam, companyId?: string) {
  if (!companyId) return null;

  const response = await api.post<IExam>(`${ApiRoutesEnum.EXAM}`, {
    ...data,
    companyId,
  });

  return response.data;
}

export function useMutCreateExam() {
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useGetCompanyId();

  return useMutation(
    async (data: ICreateExam) =>
      createExam(data, data.companyId || user?.companyId),
    {
      onSuccess: async (newExam) => {
        queryClient.invalidateQueries([QueryEnum.EXAMS]);

        enqueueSnackbar('Exame criado com sucesso', {
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
