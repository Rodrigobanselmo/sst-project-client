import { useMutation } from 'react-query';

import { useSnackbar } from 'notistack';
import { ProfessionalRespTypeEnum } from 'project/enum/professional-responsible-type.enum';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { QueryEnum } from 'core/enums/query.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { IProfessionalResponsible } from 'core/interfaces/api/IProfessionalResponsible';
import { api } from 'core/services/apiClient';
import { queryClient } from 'core/services/queryClient';

import { IErrorResp } from '../../../../../errors/types';

export interface ICreateProfessionalResponsible {
  startDate: Date;
  companyId: string;
  professionalCouncilId: number;
  type?: ProfessionalRespTypeEnum;
}

export async function createProfResp(
  data: ICreateProfessionalResponsible,
  companyId?: string,
) {
  if (!companyId) return null;

  const response = await api.post<IProfessionalResponsible>(
    ApiRoutesEnum.PROFESSIONAL_RESP.replace(':companyId', companyId),
    {
      ...data,
      companyId,
    },
  );

  return response.data;
}

export function useMutCreateProfessionalResponsible() {
  const { getCompanyId } = useGetCompanyId();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation(
    async (data: ICreateProfessionalResponsible) =>
      createProfResp(data, getCompanyId(data)),
    {
      onSuccess: async (resp) => {
        if (resp) queryClient.invalidateQueries([QueryEnum.PROFESSIONAL_RESP]);

        enqueueSnackbar('Responsável criado com sucesso', {
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
