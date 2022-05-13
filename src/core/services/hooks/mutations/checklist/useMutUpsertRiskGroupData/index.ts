import { useMutation } from 'react-query';

import { useSnackbar } from 'notistack';
import { StatusEnum } from 'project/enum/status.enum';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { QueryEnum } from 'core/enums/query.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { IRiskGroupData } from 'core/interfaces/api/IRiskData';
import { api } from 'core/services/apiClient';
import { queryClient } from 'core/services/queryClient';

import { IErrorResp } from '../../../../errors/types';

interface IUpsertRiskGroupData {
  id?: string;
  name: string;
  status?: StatusEnum;
  companyId?: string;
}

export async function upsertRiskGroupData(
  data: IUpsertRiskGroupData,
  companyId?: string,
) {
  if (!companyId) return null;

  const response = await api.post<IRiskGroupData>(
    `${ApiRoutesEnum.RISK_GROUP_DATA}`,
    {
      companyId,
      ...data,
    },
  );

  return response.data;
}

export function useMutUpsertRiskGroupData() {
  const { getCompanyId } = useGetCompanyId();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation(
    async (data: IUpsertRiskGroupData) =>
      upsertRiskGroupData(data, getCompanyId(data)),
    {
      onSuccess: async (resp) => {
        if (resp)
          queryClient.setQueryData(
            [QueryEnum.RISK_GROUP_DATA, getCompanyId(resp)],
            (oldData: IRiskGroupData[] | undefined) => {
              if (oldData) {
                const newData = [...oldData];
                const updateIndexData = oldData.findIndex(
                  (old) => old.id === resp.id,
                );

                if (updateIndexData != -1) {
                  newData[updateIndexData] = resp;
                } else {
                  newData.push(resp);
                }

                return newData;
              }
              return [];
            },
          );

        return resp;
      },
      onError: (error: IErrorResp) => {
        if (error.response?.data)
          enqueueSnackbar(error.response.data.message, { variant: 'error' });
      },
    },
  );
}