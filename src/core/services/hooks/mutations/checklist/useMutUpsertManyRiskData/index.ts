import { useMutation } from 'react-query';

import { useSnackbar } from 'notistack';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { QueryEnum } from 'core/enums/query.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { IRiskData } from 'core/interfaces/api/IRiskData';
import { api } from 'core/services/apiClient';
import { queryClient } from 'core/services/queryClient';

import { IErrorResp } from '../../../../errors/types';

export interface IUpsertManyRiskData {
  id?: string;
  companyId?: string;
  riskFactorGroupDataId: string;
  riskId: string;
  hierarchyIds?: string;
  homogeneousGroupIds?: string;
  probability?: number;
  probabilityAfter?: number;
  adms?: string[];
  recs?: string[];
  engs?: string[];
  generateSources?: string[];
  epis?: number[];
}

export async function upsertManyRiskData(
  data: IUpsertManyRiskData,
  companyId?: string,
) {
  if (!companyId) return null;

  const response = await api.post<IRiskData[]>(
    `${ApiRoutesEnum.RISK_DATA}/many`,
    {
      companyId,
      ...data,
    },
  );

  if (
    Array.isArray(response.data) &&
    response.data.length > 0 &&
    typeof response.data[0] === 'string'
  ) {
    return [
      {
        riskId: data.riskId,
        riskFactorGroupDataId: data.riskFactorGroupDataId,
        deletedIds: response.data,
      },
    ] as unknown as IRiskData[];
  }

  return response.data;
}

export function useMutUpsertManyRiskData() {
  const { getCompanyId } = useGetCompanyId();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation(
    async (data: IUpsertManyRiskData) =>
      upsertManyRiskData(data, getCompanyId(data)),
    {
      onSuccess: async (resp) => {
        if (resp && resp.length > 0) {
          queryClient.setQueryData(
            [
              QueryEnum.RISK_DATA,
              getCompanyId(resp),
              resp[0].riskFactorGroupDataId,
              resp[0].riskId,
            ],
            (oldData: IRiskData[] | undefined) => {
              if (oldData) {
                const newData = [...oldData];

                if ('deletedIds' in resp[0]) {
                  return newData.filter((item) =>
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    (resp[0] as any).deletedIds.includes(item.id),
                  );
                }

                resp.forEach((riskData) => {
                  const updateIndexData = oldData.findIndex(
                    (old) => old.id == riskData.id,
                  );

                  if (updateIndexData != -1) {
                    newData[updateIndexData] = riskData;
                  } else {
                    newData.push(riskData);
                  }
                });

                return newData;
              }
              return [];
            },
          );
          return resp;
        }
      },
      onError: (error: IErrorResp) => {
        if (error.response?.data)
          enqueueSnackbar(error.response.data.message, { variant: 'error' });
      },
    },
  );
}
