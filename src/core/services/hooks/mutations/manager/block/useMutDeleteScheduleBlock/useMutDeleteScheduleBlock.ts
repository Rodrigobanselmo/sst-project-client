import { useMutation } from 'react-query';

import { useSnackbar } from 'notistack';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { QueryEnum } from 'core/enums/query.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { IScheduleBlock } from 'core/interfaces/api/IScheduleBlock';
import { api } from 'core/services/apiClient';
import { queryClient } from 'core/services/queryClient';

import { IErrorResp } from '../../../../../errors/types';

export interface IDeleteScheduleBlock {
  id?: number;
  companyId?: string;
}

export async function upsertRiskDocs(
  data: IDeleteScheduleBlock,
  companyId?: string,
) {
  if (!companyId) return null;

  const response = await api.delete<IScheduleBlock>(
    ApiRoutesEnum.SCHEDULE_BLOCKS.replace(':companyId', companyId) +
      '/' +
      data.id,
  );

  return response.data;
}

export function useMutDeleteScheduleBlock() {
  const { getCompanyId } = useGetCompanyId();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation(
    async (data: IDeleteScheduleBlock) =>
      upsertRiskDocs(data, getCompanyId(data)),
    {
      onSuccess: async (resp) => {
        if (resp) queryClient.invalidateQueries([QueryEnum.SCHEDULE_BLOCKS]);

        enqueueSnackbar('Bloqueio deletado com sucesso', {
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
