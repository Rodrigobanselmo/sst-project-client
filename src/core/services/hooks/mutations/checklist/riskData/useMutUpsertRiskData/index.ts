import { useMutation } from 'react-query';

import { useSnackbar } from 'notistack';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { HomoTypeEnum } from 'core/enums/homo-type.enum';
import { QueryEnum } from 'core/enums/query.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { IRiskData } from 'core/interfaces/api/IRiskData';
import { api } from 'core/services/apiClient';
import { queryClient } from 'core/services/queryClient';

import { IErrorResp } from '../../../../../errors/types';

export interface IUpsertRiskData {
  id?: string;
  companyId?: string;
  riskFactorGroupDataId: string;
  riskId?: string;
  riskIds?: string[];
  hierarchyId?: string;
  homogeneousGroupId?: string;
  probability?: number;
  probabilityAfter?: number;
  adms?: string[];
  recs?: string[];
  engs?: string[];
  type?: HomoTypeEnum;
  generateSources?: string[];
  workspaceId?: string;
  epis?: number[];
  keepEmpty?: boolean;
}

export async function upsertRiskData(
  data: IUpsertRiskData,
  companyId?: string,
) {
  if (!companyId) return null;

  const response = await api.post<IRiskData>(`${ApiRoutesEnum.RISK_DATA}`, {
    companyId,
    ...data,
  });

  if (typeof response.data === 'string') {
    return {
      riskId: data.riskId,
      riskFactorGroupDataId: data.riskFactorGroupDataId,
      homogeneousGroupId: data.homogeneousGroupId,
      deletedId: response.data,
    } as unknown as IRiskData;
  }

  return response.data;
}

export function useMutUpsertRiskData() {
  const { getCompanyId } = useGetCompanyId();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation(
    async (data: IUpsertRiskData) => upsertRiskData(data, getCompanyId(data)),
    {
      onSuccess: async (resp) => {
        if (resp) {
          const replace = (lastId: string) => {
            queryClient.setQueryData(
              [
                QueryEnum.RISK_DATA,
                getCompanyId(resp),
                resp.riskFactorGroupDataId,
                lastId,
              ],
              (oldData: IRiskData[] | undefined) => {
                if (oldData) {
                  const newData = [...oldData];

                  if ('deletedId' in resp) {
                    return newData.filter(
                      (item) => item.id !== (resp as any).deletedId,
                    );
                  }

                  const updateIndexData = oldData.findIndex(
                    (old) => old.id == resp.id,
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
          };

          replace(resp.riskId);
          if (resp.homogeneousGroupId) replace(resp.homogeneousGroupId);
        }

        return resp;
      },
      onError: (error: IErrorResp) => {
        if (error.response?.data)
          enqueueSnackbar(error.response.data.message, { variant: 'error' });
      },
    },
  );
}
