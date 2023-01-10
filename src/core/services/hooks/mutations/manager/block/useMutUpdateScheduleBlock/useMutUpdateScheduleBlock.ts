import { useMutation } from 'react-query';

import { useSnackbar } from 'notistack';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { QueryEnum } from 'core/enums/query.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { IScheduleBlock } from 'core/interfaces/api/IScheduleBlock';
import { api } from 'core/services/apiClient';
import { queryClient } from 'core/services/queryClient';

import { IErrorResp } from '../../../../../errors/types';
import { ICreateScheduleBlock } from '../useMutCreateScheduleBlock/useMutCreateScheduleBlock';

export interface IUpdateScheduleBlock extends Partial<ICreateScheduleBlock> {
  id?: number;
}

export async function upsertRiskDocs(
  data: IUpdateScheduleBlock,
  companyId?: string,
) {
  if (!companyId) return null;

  const response = await api.patch<IScheduleBlock>(
    ApiRoutesEnum.SCHEDULE_BLOCKS.replace(':companyId', companyId) +
      '/' +
      data.id,
    {
      ...data,
      companyId,
    },
  );

  return response.data;
}

export function useMutUpdateScheduleBlock() {
  const { getCompanyId } = useGetCompanyId();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation(
    async (data: IUpdateScheduleBlock) =>
      upsertRiskDocs(data, getCompanyId(data)),
    {
      onSuccess: async (resp) => {
        queryClient.invalidateQueries([QueryEnum.SCHEDULE_BLOCKS]);

        enqueueSnackbar('Bloqueio editado com sucesso', {
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
