import { useMutation } from 'react-query';

import { useSnackbar } from 'notistack';
import { StatusEnum } from 'project/enum/status.enum';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { HomoTypeEnum } from 'core/enums/homo-type.enum';
import { QueryEnum } from 'core/enums/query.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { IRiskData, IRiskDataRec } from 'core/interfaces/api/IRiskData';
import { api } from 'core/services/apiClient';
import { sortRiskData } from 'core/services/hooks/queries/useQueryRiskData';
import { queryClient } from 'core/services/queryClient';
import { removeDuplicate } from 'core/utils/helpers/removeDuplicate';
import { sortString } from 'core/utils/sorts/string.sort';

import { IErrorResp } from '../../../../../errors/types';
import {
  RiskRecTextTypeEnum,
  RiskRecTypeEnum,
} from './../../../../../../../project/enum/RiskRecType.enum';

export interface IUpsertRiskDataRec {
  id?: string;
  companyId?: string;
  responsibleName?: string;
  endDate?: Date;
  comment?: {
    text?: string;
    type?: RiskRecTypeEnum;
    textType?: RiskRecTextTypeEnum;
  }[];
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

export function useMutUpsertRiskDataRec(riskFactorGroupDataId: string) {
  const { getCompanyId } = useGetCompanyId();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation(
    async (data: IUpsertRiskDataRec) =>
      upsertRiskData(data, getCompanyId(data)),
    {
      onSuccess: async (resp) => {
        if (resp) {
          const actualData = queryClient.getQueryData([
            QueryEnum.RISK_DATA,
            getCompanyId(resp),
            riskFactorGroupDataId,
          ]);
          if (actualData) {
            queryClient.setQueryData(
              [QueryEnum.RISK_DATA, getCompanyId(resp), riskFactorGroupDataId],
              (oldData: IRiskData[] | undefined) => {
                if (oldData) {
                  const newData = [...oldData];

                  const updateIndexData = oldData.findIndex(
                    (old) => old?.id && resp.riskFactorDataId,
                  );

                  if (updateIndexData != -1) {
                    const dataRecs = newData[updateIndexData].dataRecs || [];
                    const updateIndexRecData = dataRecs.findIndex(
                      (old) => old?.id && resp.id,
                    );

                    if (updateIndexData != -1) {
                      dataRecs[updateIndexRecData] = resp;
                      newData[updateIndexData].dataRecs = dataRecs;
                    } else {
                      newData[updateIndexData].dataRecs = [...dataRecs, resp];
                    }

                    return newData;
                  }

                  return newData;
                }
                return [];
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
