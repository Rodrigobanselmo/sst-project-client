import { useMutation } from 'react-query';

import { useSnackbar } from 'notistack';
import { ProfessionalTypeEnum } from 'project/enum/professional-type.enum';
import { StatusEnum } from 'project/enum/status.enum';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { QueryEnum } from 'core/enums/query.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { IProfessional } from 'core/interfaces/api/IProfessional';
import { IMutationOptions } from 'core/interfaces/IMutationOptions';
import { api } from 'core/services/apiClient';
import { queryClient } from 'core/services/queryClient';

import { IErrorResp } from '../../../../../errors/types';

export interface ICreateProfessional {
  name: string;
  cpf?: string;
  phone?: string;
  email?: string;
  inviteId?: string;
  userId?: number;
  sendEmail?: boolean;
  companyId?: string;
  certifications?: string[];
  formation?: string[];
  councils?: { councilType?: string; councilUF?: string; councilId?: string }[];
  type: ProfessionalTypeEnum;
  status?: StatusEnum;
}

export async function updateProfessionalApi(data: ICreateProfessional) {
  const response = await api.post<IProfessional>(
    `${ApiRoutesEnum.PROFESSIONALS}`,
    {
      ...data,
    },
  );
  return response.data;
}

export function useMutCreateProfessional({
  successMessage = 'Profissional criado com sucesso',
}: IMutationOptions = {}) {
  const { enqueueSnackbar } = useSnackbar();
  const { companyId } = useGetCompanyId();

  return useMutation(
    async (data: ICreateProfessional) =>
      updateProfessionalApi({ companyId, ...data }),
    {
      onSuccess: async (Professional) => {
        if (Professional) {
          queryClient.invalidateQueries([QueryEnum.PROFESSIONALS]);
        }
        enqueueSnackbar(successMessage, {
          variant: 'success',
        });
      },
      onError: (error: IErrorResp) => {
        enqueueSnackbar(error.response.data.message, { variant: 'error' });
      },
    },
  );
}
