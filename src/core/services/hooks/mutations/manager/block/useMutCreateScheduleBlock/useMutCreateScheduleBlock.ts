import { useMutation } from 'react-query';

import { useSnackbar } from 'notistack';
import { StatusEnum } from 'project/enum/status.enum';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { QueryEnum } from 'core/enums/query.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import {
  IScheduleBlock,
  ScheduleBlockTypeEnum,
} from 'core/interfaces/api/IScheduleBlock';
import { api } from 'core/services/apiClient';
import { queryClient } from 'core/services/queryClient';

import { IErrorResp } from '../../../../../errors/types';

export interface ICreateScheduleBlock {
  name: string;
  companyId: string;
  description?: string;
  startDate?: Date;
  endDate?: Date;
  startTime?: string;
  endTime?: string;
  yearRecurrence?: boolean;
  allCompanies?: boolean;
  type?: ScheduleBlockTypeEnum;
  status?: StatusEnum;
  companiesIds?: string[];
}

export async function upsertRiskDocs(
  data: ICreateScheduleBlock,
  companyId?: string,
) {
  if (!companyId) return null;

  const response = await api.post<IScheduleBlock>(
    ApiRoutesEnum.SCHEDULE_BLOCKS.replace(':companyId', companyId),
    {
      ...data,
      companyId,
    },
  );

  return response.data;
}

export function useMutCreateScheduleBlock() {
  const { getCompanyId } = useGetCompanyId();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation(
    async (data: ICreateScheduleBlock) =>
      upsertRiskDocs(data, getCompanyId(data)),
    {
      onSuccess: async (resp) => {
        queryClient.invalidateQueries([QueryEnum.SCHEDULE_BLOCKS]);

        enqueueSnackbar('Bloqueio criado com sucesso', {
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
