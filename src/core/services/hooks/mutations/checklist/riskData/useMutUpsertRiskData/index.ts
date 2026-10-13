import { useMutation } from 'react-query';

import { useSnackbar } from 'notistack';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { HomoTypeEnum } from 'core/enums/homo-type.enum';
import { QueryEnum } from 'core/enums/query.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { IEpiRiskData } from 'core/interfaces/api/IEpi';
import { IExamRiskData } from 'core/interfaces/api/IExam';
import { IRiskData } from 'core/interfaces/api/IRiskData';
import { QualitativeProbabilityCriteria } from 'components/organisms/modals/ModalAddProbability/qualitative-probability.util';
import { IEngsRiskData } from 'core/interfaces/api/IRiskFactors';
import { api } from 'core/services/apiClient';
import {
  riskDataByRiskQueryKey,
  riskDataByRiskQueryKeyPrefix,
  sortRiskData,
} from 'core/services/hooks/queries/useQueryRiskData';
import { queryClient } from 'core/services/queryClient';

import { IErrorResp } from '../../../../../errors/types';
import { ExposureTypeEnum } from 'core/enums/exposure.enum';
import { MedTypeEnum } from 'project/enum/medType.enum';
import { RecTypeEnum } from 'project/enum/recType.enum';
import {
  isSameRiskFactorDataCacheRow,
  mergeRiskFactorDataCacheList,
  riskFactorDataByGhoQueryKey,
  riskFactorDataByGhoQueryKeyPrefix,
} from '../merge-risk-factor-data-cache.util';
import {
  mergeProbabilityWriteIntoRiskRow,
  touchesWorkspaceProbability,
} from 'core/utils/workspace-probability-evaluation.util';

export interface IUpsertRiskData {
  id?: string;
  companyId?: string;
  riskFactorGroupDataId: string;
  riskId?: string;
  riskIds?: string[];
  hierarchyId?: string;
  homogeneousGroupId?: string;
  standardExams?: boolean;
  probability?: number;
  probabilityAfter?: number;
  probabilityCriteria?: QualitativeProbabilityCriteria | null;
  adms?: string[];
  recs?: string[];
  exposure?: ExposureTypeEnum;
  type?: HomoTypeEnum;
  generateSources?: string[];
  workspaceId?: string;
  epis?: IEpiRiskData[];
  engs?: IEngsRiskData[];
  exams?: IExamRiskData[];
  keepEmpty?: boolean;
  json?: any;
  activities?: any;
  startDate?: Date;
  endDate?: Date;
  recAddOnly?: {
    recName?: string;
    companyId: string;
    recType?: RecTypeEnum;
  }[];
  admsAddOnly?: {
    medName?: string;
    medType?: MedTypeEnum;
    recType?: RecTypeEnum;
    companyId: string;
  }[];
  generateSourcesAddOnly?: { name?: string; companyId: string }[];
  engsAddOnly?: {
    medName?: string;
    companyId: string;
    medType?: MedTypeEnum;
  }[];
  informativeControlLink?: {
    recMedId: string;
    controlRecMedId?: string | null;
    medType?: 'ADM' | 'ENG';
  };
}

export async function upsertRiskData(
  data: IUpsertRiskData,
  companyId?: string,
  routeWorkspaceId?: string,
) {
  if (!companyId) return null;

  const workspaceId = data.workspaceId || routeWorkspaceId;

  const response = await api.post<IRiskData>(`${ApiRoutesEnum.RISK_DATA}`, {
    companyId,
    ...data,
    ...(workspaceId ? { workspaceId } : {}),
  });

  if (typeof response.data === 'string') {
    return {
      riskId: data.riskId,
      riskFactorGroupDataId: data.riskFactorGroupDataId,
      homogeneousGroupId: data.homogeneousGroupId,
      deletedId: response.data,
    } as unknown as IRiskData;
  }
  return sortRiskData([response.data])[0];
}

export function useMutUpsertRiskData() {
  const { getCompanyId, workspaceId, router } = useGetCompanyId();
  const { enqueueSnackbar } = useSnackbar();
  const operationWorkspaceId =
    workspaceId || (router.query.tabWorkspaceId as string | undefined);

  return useMutation(
    async (data: IUpsertRiskData) =>
      upsertRiskData(
        data,
        getCompanyId(data),
        data.workspaceId || operationWorkspaceId,
      ),
    {
      onSuccess: async (resp, variables) => {
        const companyId = getCompanyId(resp?.companyId);
        const scopedWorkspace =
          variables?.workspaceId || resp?.workspaceId || operationWorkspaceId || undefined;

        if (resp?.id && resp.riskFactorGroupDataId && resp.homogeneousGroupId) {
          const incoming = {
            ...resp,
            workspaceId: scopedWorkspace || resp.workspaceId,
          };
          const merge = (old: IRiskData[] | undefined) => {
            if (!touchesWorkspaceProbability(variables || {})) {
              return mergeRiskFactorDataCacheList(old, incoming);
            }
            if (!Array.isArray(old)) return old;
            return old.map((item) =>
              isSameRiskFactorDataCacheRow(item, incoming)
                ? mergeProbabilityWriteIntoRiskRow(item, incoming, variables)
                : item,
            );
          };

          queryClient.setQueriesData<IRiskData[] | undefined>(
            riskFactorDataByGhoQueryKey({
              companyId,
              riskFactorGroupDataId: resp.riskFactorGroupDataId,
              homogeneousGroupId: resp.homogeneousGroupId,
              workspaceId: scopedWorkspace,
            }),
            merge,
          );
          queryClient.setQueriesData<IRiskData[] | undefined>(
            riskFactorDataByGhoQueryKey({
              companyId,
              riskFactorGroupDataId: resp.riskFactorGroupDataId,
              homogeneousGroupId: resp.homogeneousGroupId,
              workspaceId: scopedWorkspace,
              effective: true,
            }),
            merge,
          );
          if (resp.riskId) {
            queryClient.setQueriesData<IRiskData[] | undefined>(
              riskDataByRiskQueryKey({
                companyId,
                riskGroupId: resp.riskFactorGroupDataId,
                riskId: resp.riskId,
                workspaceId: scopedWorkspace,
              }),
              merge,
            );
          }
        }

        if (resp?.riskFactorGroupDataId && resp?.riskId) {
          queryClient.invalidateQueries(
            riskDataByRiskQueryKeyPrefix({
              companyId,
              riskGroupId: resp.riskFactorGroupDataId,
              riskId: resp.riskId,
            }),
          );
        }

        queryClient.invalidateQueries([QueryEnum.ENVIRONMENT]);
        queryClient.invalidateQueries([QueryEnum.EXAMS_RISK_DATA]);
        queryClient.invalidateQueries([QueryEnum.CHARACTERIZATION]);

        if (resp?.riskFactorGroupDataId && resp?.homogeneousGroupId) {
          queryClient.invalidateQueries(
            riskFactorDataByGhoQueryKeyPrefix({
              companyId,
              riskFactorGroupDataId: resp.riskFactorGroupDataId,
              homogeneousGroupId: resp.homogeneousGroupId,
            }),
          );
        } else {
          queryClient.invalidateQueries([QueryEnum.RISK_DATA, companyId]);
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
