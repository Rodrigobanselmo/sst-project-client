import { RiskMatrixRoutes } from '@v2/constants/routes/risk-matrix.routes';
import { bindUrlParams } from '@v2/utils/bind-ul-params';
import { api } from 'core/services/apiClient';

import type {
  BrowseRiskMatricesResponse,
  CreateRiskMatrixPayload,
  MatrixWorkspaceAvailability,
  ReplaceRiskMatrixDraftPayload,
  RiskMatrixBrowseItem,
  RiskMatrixIdentity,
  RiskMatrixVersion,
  SwitchWorkspaceRiskMatrixPayload,
  SystemRiskMatrixProjection,
  WorkspaceRiskMatrixAvailability,
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

export async function duplicateRiskMatrix(params: {
  companyId: string;
  matrixId: string;
}): Promise<RiskMatrixBrowseItem> {
  const response = await api.post<RiskMatrixBrowseItem>(
    bindUrlParams({
      path: RiskMatrixRoutes.DUPLICATE,
      pathParams: {
        companyId: params.companyId,
        matrixId: params.matrixId,
      },
    }),
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

export async function browseMatrixWorkspaceAvailability(params: {
  companyId: string;
  matrixId: string;
}): Promise<MatrixWorkspaceAvailability> {
  const response = await api.get<MatrixWorkspaceAvailability>(
    bindUrlParams({
      path: RiskMatrixRoutes.WORKSPACE_AVAILABILITY,
      pathParams: {
        companyId: params.companyId,
        matrixId: params.matrixId,
      },
    }),
  );

  return response.data;
}

export async function enableWorkspaceRiskMatrix(params: {
  companyId: string;
  workspaceId: string;
  versionId: string;
}): Promise<WorkspaceRiskMatrixAvailability> {
  const response = await api.put<WorkspaceRiskMatrixAvailability>(
    bindUrlParams({
      path: RiskMatrixRoutes.WORKSPACE_VERSION,
      pathParams: {
        companyId: params.companyId,
        workspaceId: params.workspaceId,
        versionId: params.versionId,
      },
    }),
  );

  return response.data;
}

export async function disableWorkspaceRiskMatrix(params: {
  companyId: string;
  workspaceId: string;
  versionId: string;
}): Promise<WorkspaceRiskMatrixAvailability> {
  const response = await api.delete<WorkspaceRiskMatrixAvailability>(
    bindUrlParams({
      path: RiskMatrixRoutes.WORKSPACE_VERSION,
      pathParams: {
        companyId: params.companyId,
        workspaceId: params.workspaceId,
        versionId: params.versionId,
      },
    }),
  );

  return response.data;
}

export async function switchWorkspaceRiskMatrix(params: {
  companyId: string;
  workspaceId: string;
  payload: SwitchWorkspaceRiskMatrixPayload;
}): Promise<WorkspaceRiskMatrixAvailability> {
  const response = await api.post<WorkspaceRiskMatrixAvailability>(
    bindUrlParams({
      path: RiskMatrixRoutes.WORKSPACE_SWITCH,
      pathParams: {
        companyId: params.companyId,
        workspaceId: params.workspaceId,
      },
    }),
    params.payload,
  );

  return response.data;
}

export async function readSystemRiskMatrix(): Promise<SystemRiskMatrixProjection> {
  const response = await api.get<SystemRiskMatrixProjection>(
    RiskMatrixRoutes.SYSTEM,
  );

  return response.data;
}
