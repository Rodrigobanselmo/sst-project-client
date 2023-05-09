import { useMutation } from 'react-query';

import { useSnackbar } from 'notistack';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { QueryEnum } from 'core/enums/query.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { IContact } from 'core/interfaces/api/IContact';
import { api } from 'core/services/apiClient';
import { queryClient } from 'core/services/queryClient';

import { IErrorResp } from '../../../../../errors/types';
import { ICreateScheduleMedicalExam } from '../useMutCreateScheduleMedicalVisit/useMutCreateScheduleMedicalVisit';
import { IScheduleMedicalVisit } from 'core/interfaces/api/IScheduleMedicalVisit';

export interface IUpdateScheduleMedicalExam extends ICreateScheduleMedicalExam {
  id?: number;
}

export async function upsertRiskDocs(
  data: IUpdateScheduleMedicalExam,
  companyId?: string,
) {
  if (!companyId) return null;

  const response = await api.patch<IScheduleMedicalVisit>(
    ApiRoutesEnum.SCHEDULE_MEDICAL_VISIT.replace(':companyId', companyId) +
      '/' +
      data.id,
    {
      ...data,
      companyId,
    },
  );

  return response.data;
}

export function useMutUpdateScheduleMedicalVisit() {
  const { getCompanyId } = useGetCompanyId();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation(
    async (data: IUpdateScheduleMedicalExam) =>
      upsertRiskDocs(data, getCompanyId(data)),
    {
      onSuccess: async (resp) => {
        if (resp) {
          queryClient.invalidateQueries([QueryEnum.SCHEDULE_MEDICAL_VISIT]);
          queryClient.invalidateQueries([QueryEnum.EMPLOYEES]);
        }

        enqueueSnackbar('Visita médica editado com sucesso', {
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
