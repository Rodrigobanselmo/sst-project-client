import { RiskMatrixRoutes } from '@v2/constants/routes/risk-matrix.routes';
import { bindUrlParams } from '@v2/utils/bind-ul-params';
import { api } from 'core/services/apiClient';

import type {
  BrowseRiskMatricesResponse,
  CreateRiskMatrixPayload,
  ReplaceRiskMatrixDraftPayload,
  RiskMatrixBrowseItem,
  RiskMatrixIdentity,
  RiskMatrixVersion,
} from './risk-matrix.types';

export async function browseRiskMatrices(params: {
  companyId: string;
}): Promise<BrowseRiskMatricesResponse> {
  const response = await api.get<BrowseRiskMatricesResponse>(
    bindUrlParams({
      path: RiskMatrixRoutes.BASE,
      pathParams: { companyId: params.companyId },
    }),
  );

  return response.data;
}

export async function createRiskMatrix(params: {
  companyId: string;
  payload: CreateRiskMatrixPayload;
}): Promise<RiskMatrixBrowseItem> {
  const response = await api.post<RiskMatrixBrowseItem>(
    bindUrlParams({
      path: RiskMatrixRoutes.BASE,
      pathParams: { companyId: params.companyId },
    }),
    params.payload,
  );

  return response.data;
}

export async function readRiskMatrix(params: {
  companyId: string;
  matrixId: string;
}): Promise<RiskMatrixIdentity> {
  const response = await api.get<RiskMatrixIdentity>(
    bindUrlParams({
      path: RiskMatrixRoutes.BY_ID,
      pathParams: {
        companyId: params.companyId,
        matrixId: params.matrixId,
      },
    }),
  );

  return response.data;
}

export async function readRiskMatrixVersion(params: {
  companyId: string;
  matrixId: string;
  versionId: string;
}): Promise<RiskMatrixVersion> {
  const response = await api.get<RiskMatrixVersion>(
    bindUrlParams({
      path: RiskMatrixRoutes.VERSION,
      pathParams: {
        companyId: params.companyId,
        matrixId: params.matrixId,
        versionId: params.versionId,
      },
    }),
  );

  return response.data;
}

export async function replaceRiskMatrixDraft(params: {
  companyId: string;
  matrixId: string;
  versionId: string;
  payload: ReplaceRiskMatrixDraftPayload;
}): Promise<RiskMatrixVersion> {
  const response = await api.put<RiskMatrixVersion>(
    bindUrlParams({
      path: RiskMatrixRoutes.VERSION,
      pathParams: {
        companyId: params.companyId,
        matrixId: params.matrixId,
        versionId: params.versionId,
      },
    }),
    params.payload,
  );

  return response.data;
}

export async function publishRiskMatrixVersion(params: {
  companyId: string;
  matrixId: string;
  versionId: string;
}): Promise<RiskMatrixVersion> {
  const response = await api.post<RiskMatrixVersion>(
    bindUrlParams({
      path: RiskMatrixRoutes.PUBLISH,
      pathParams: {
        companyId: params.companyId,
        matrixId: params.matrixId,
        versionId: params.versionId,
      },
    }),
  );

  return response.data;
}
