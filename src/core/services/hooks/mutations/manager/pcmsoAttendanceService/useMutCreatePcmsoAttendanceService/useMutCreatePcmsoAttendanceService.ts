import { useMutation } from 'react-query';

import { useSnackbar } from 'notistack';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { QueryEnum } from 'core/enums/query.enums';
import {
  IPcmsoAttendanceService,
  PcmsoAttendanceServiceTypeEnum,
} from 'core/interfaces/api/IPcmsoAttendanceService';
import { api } from 'core/services/apiClient';
import { queryClient } from 'core/services/queryClient';

import { IErrorResp } from '../../../../../errors/types';

export interface ICreatePcmsoAttendanceService {
  name: string;
  workspaceId: string;
  companyId?: string;
  serviceType: PcmsoAttendanceServiceTypeEnum;
  address?: string;
  phone?: string;
  distanceLabel?: string;
  travelTimeLabel?: string;
  notes?: string;
  sortOrder?: number;
}

export async function createPcmsoAttendanceService(
  data: ICreatePcmsoAttendanceService,
  companyId?: string,
) {
  if (!companyId) return null;

  const response = await api.post<IPcmsoAttendanceService>(
    ApiRoutesEnum.PCMSO_ATTENDANCE_SERVICES.replace(':companyId', companyId).replace(
      ':workspaceId',
      data.workspaceId,
    ),
    {
      ...data,
      companyId,
    },
  );

  return response.data;
}

export function useMutCreatePcmsoAttendanceService() {
  const { getCompanyId } = useGetCompanyId();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation(
    async (data: ICreatePcmsoAttendanceService) =>
      createPcmsoAttendanceService(data, getCompanyId(data)),
    {
      onSuccess: async (_resp, variables) => {
        const companyId = getCompanyId(variables);
        await queryClient.invalidateQueries([
          QueryEnum.PCMSO_ATTENDANCE_SERVICES,
          companyId,
          variables.workspaceId,
        ]);
        enqueueSnackbar('Serviço de atendimento criado com sucesso', {
          variant: 'success',
        });
      },
      onError: (error: IErrorResp) => {
        enqueueSnackbar(error.response?.data?.message || 'Erro ao criar serviço', {
          variant: 'error',
        });
      },
    },
  );
}
