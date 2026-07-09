import { useMutation } from 'react-query';

import { useSnackbar } from 'notistack';
import { StatusEnum } from 'project/enum/status.enum';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { QueryEnum } from 'core/enums/query.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import {
  IPcmsoAttendanceService,
  PcmsoAttendanceServiceTypeEnum,
} from 'core/interfaces/api/IPcmsoAttendanceService';
import { api } from 'core/services/apiClient';
import { queryClient } from 'core/services/queryClient';

import { IErrorResp } from '../../../../../errors/types';

export interface IUpdatePcmsoAttendanceService {
  id: string;
  workspaceId: string;
  companyId?: string;
  name: string;
  serviceType: PcmsoAttendanceServiceTypeEnum;
  address?: string;
  phone?: string;
  distanceLabel?: string;
  travelTimeLabel?: string;
  notes?: string;
  sortOrder?: number;
  status?: StatusEnum;
}

export async function updatePcmsoAttendanceService(
  data: IUpdatePcmsoAttendanceService,
  companyId?: string,
) {
  if (!companyId) return null;

  const response = await api.patch<IPcmsoAttendanceService>(
    `${ApiRoutesEnum.PCMSO_ATTENDANCE_SERVICES.replace(':companyId', companyId).replace(
      ':workspaceId',
      data.workspaceId,
    )}/${data.id}`,
    {
      ...data,
      companyId,
    },
  );

  return response.data;
}

export function useMutUpdatePcmsoAttendanceService() {
  const { getCompanyId } = useGetCompanyId();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation(
    async (data: IUpdatePcmsoAttendanceService) =>
      updatePcmsoAttendanceService(data, getCompanyId(data)),
    {
      onSuccess: async (_resp, variables) => {
        const companyId = getCompanyId(variables);
        await queryClient.invalidateQueries([
          QueryEnum.PCMSO_ATTENDANCE_SERVICES,
          companyId,
          variables.workspaceId,
        ]);
        enqueueSnackbar('Serviço de atendimento atualizado com sucesso', {
          variant: 'success',
        });
      },
      onError: (error: IErrorResp) => {
        enqueueSnackbar(error.response?.data?.message || 'Erro ao atualizar serviço', {
          variant: 'error',
        });
      },
    },
  );
}
