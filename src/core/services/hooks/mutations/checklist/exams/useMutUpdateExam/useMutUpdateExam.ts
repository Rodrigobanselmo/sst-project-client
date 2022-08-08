import { useMutation } from 'react-query';

import { useSnackbar } from 'notistack';
import { StatusEnum } from 'project/enum/status.enum';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { QueryEnum } from 'core/enums/query.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { ExamTypeEnum, IExam } from 'core/interfaces/api/IExam';
import { api } from 'core/services/apiClient';
import { queryClient } from 'core/services/queryClient';

import { IErrorResp } from '../../../../../errors/types';

interface ICreateExam {
  id?: number;
  name: string;
  companyId: string;
  status?: StatusEnum;
  instruction?: string;
  material?: string;
  type?: ExamTypeEnum;
  analyses?: string;
}

export async function updateExam(data: ICreateExam, companyId?: string) {
  if (!companyId) return null;

  const response = await api.patch<IExam>(
    `${ApiRoutesEnum.EXAM}/${data.id}/${companyId}`,
    {
      ...data,
      companyId,
    },
  );

  return response.data;
}

export function useMutUpdateExam() {
  const { user } = useGetCompanyId();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation(
    async (data: ICreateExam) =>
      updateExam(data, data.companyId || user?.companyId),
    {
      onSuccess: async (newExam) => {
        if (newExam) {
          queryClient.invalidateQueries([QueryEnum.EXAMS]);
        }

        enqueueSnackbar('Exame criado com sucesso', {
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
