import { useMutation } from 'react-query';

import clone from 'clone';
import { useSnackbar } from 'notistack';
import { StatusEnum } from 'project/enum/status.enum';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { QueryEnum } from 'core/enums/query.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { IRiskData, IRiskDataRec } from 'core/interfaces/api/IRiskData';
import { IPaginationReturn } from 'core/interfaces/IPaginationResponse';
import { api } from 'core/services/apiClient';
import { queryClient } from 'core/services/queryClient';

import { IErrorResp } from '../../../../../errors/types';
import {
  RiskRecTextTypeEnum,
  RiskRecTypeEnum,
} from './../../../../../../../project/enum/RiskRecType.enum';

export interface IUpsertRiskDataRec {
  id?: string;
  companyId?: string;
  responsibleName?: string;
  endDate?: string;
  comment?: {
    text?: string;
    type?: RiskRecTypeEnum;
    textType?: RiskRecTextTypeEnum;
  };
  status?: StatusEnum;
  recMedId: string;
  riskFactorDataId: string;
}

export async function upsertRiskData(
  data: IUpsertRiskDataRec,
  companyId?: string,
) {
  if (!companyId) return null;
  const response = await api.post<IRiskDataRec>(
    `${ApiRoutesEnum.RISK_DATA_REC}`,
    {
      companyId,
      ...data,
    },
  );

  return response.data;
}

export function useMutUpsertRiskDataRec(
  riskFactorGroupDataId: string,
  page = 1,
) {
  const { getCompanyId, workspaceId } = useGetCompanyId();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation(
    async (data: IUpsertRiskDataRec) =>
      upsertRiskData(data, getCompanyId(data)),
    {
      onSuccess: async (resp) => {
        if (resp) {
          const actualData = queryClient.getQueryData<
            IPaginationReturn<IRiskData>
          >([
            QueryEnum.RISK_DATA_PLAN,
            getCompanyId(resp),
            workspaceId,
            riskFactorGroupDataId,
            page,
          ]);

          if (actualData) {
            queryClient.setQueryData(
              [
                QueryEnum.RISK_DATA_PLAN,
                getCompanyId(resp),
                workspaceId,
                riskFactorGroupDataId,
                page,
              ],
              (oldData: IPaginationReturn<IRiskData> | undefined) => {
                if (oldData) {
                  const newData = clone(oldData);

                  const updateIndexData = newData.data?.findIndex(
                    (old) => old?.id == resp.riskFactorDataId,
                  );

                  if (updateIndexData != -1 && updateIndexData != undefined) {
                    const dataRecs =
                      newData.data?.[updateIndexData].dataRecs || [];
                    const updateIndexRecData = dataRecs.findIndex(
                      (old) => old?.id == resp.id,
                    );
                    if (newData.data && newData.data?.[updateIndexData]) {
                      if (updateIndexRecData != -1) {
                        dataRecs[updateIndexRecData] = resp;
                        newData.data[updateIndexData].dataRecs = dataRecs;
                      } else {
                        newData.data[updateIndexData].dataRecs = [
                          ...dataRecs,
                          resp,
                        ];
                      }
                    }

                    return newData as IPaginationReturn<IRiskData>;
                  }

                  return newData as IPaginationReturn<IRiskData>;
                }
                return [] as IPaginationReturn<IRiskData>;
              },
            );
          }
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
