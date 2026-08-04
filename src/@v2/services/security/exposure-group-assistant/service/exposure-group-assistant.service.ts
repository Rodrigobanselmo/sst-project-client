import { ExposureGroupAssistantRoutes } from '@v2/constants/routes/exposure-group-assistant.routes';
import { bindUrlParams } from '@v2/utils/bind-ul-params';
import { api } from 'core/services/apiClient';

import type {
  AnalyzeDevelopedRoleDeletionParams,
  DeleteDevelopedRoleParams,
  DeleteDevelopedRoleResult,
  DevelopedRoleDeletionAnalysis,
  ExposureGroupAssistantDiagnosisResponse,
  JustifyIntegrityReviewParams,
  JustifyIntegrityReviewResponse,
  ReopenIntegrityReviewParams,
  ReopenIntegrityReviewResponse,
  RunExposureGroupDiagnosisParams,
} from './exposure-group-assistant.types';

export async function runExposureGroupDiagnosis(
  params: RunExposureGroupDiagnosisParams,
): Promise<ExposureGroupAssistantDiagnosisResponse> {
  const response = await api.post<ExposureGroupAssistantDiagnosisResponse>(
    bindUrlParams({
      path: ExposureGroupAssistantRoutes.DIAGNOSIS,
      pathParams: {
        companyId: params.companyId,
        workspaceId: params.workspaceId,
      },
    }),
    {},
  );
  return response.data;
}

export async function analyzeDevelopedRoleDeletion(
  params: AnalyzeDevelopedRoleDeletionParams,
): Promise<DevelopedRoleDeletionAnalysis> {
  const response = await api.get<DevelopedRoleDeletionAnalysis>(
    bindUrlParams({
      path: ExposureGroupAssistantRoutes.DEVELOPED_ROLE_DELETION_ELIGIBILITY,
      pathParams: {
        companyId: params.companyId,
        workspaceId: params.workspaceId,
        hierarchyId: params.hierarchyId,
      },
    }),
  );
  return response.data;
}

export async function deleteDevelopedRole(
  params: DeleteDevelopedRoleParams,
): Promise<DeleteDevelopedRoleResult> {
  const response = await api.delete<DeleteDevelopedRoleResult>(
    bindUrlParams({
      path: ExposureGroupAssistantRoutes.DEVELOPED_ROLE_DELETE,
      pathParams: {
        companyId: params.companyId,
        workspaceId: params.workspaceId,
        hierarchyId: params.hierarchyId,
      },
    }),
    {
      data: {
        expectedAnalysisHash: params.expectedAnalysisHash,
        confirmation: params.confirmation,
      },
    },
  );
  return response.data;
}

export async function justifyIntegrityReview(
  params: JustifyIntegrityReviewParams,
): Promise<JustifyIntegrityReviewResponse> {
  const response = await api.post<JustifyIntegrityReviewResponse>(
    bindUrlParams({
      path: ExposureGroupAssistantRoutes.INTEGRITY_REVIEW_JUSTIFY,
      pathParams: {
        companyId: params.companyId,
        workspaceId: params.workspaceId,
        elementId: params.elementId,
      },
    }),
    {
      reason: params.reason,
      findingKind: params.findingKind,
    },
  );
  return response.data;
}

export async function reopenIntegrityReview(
  params: ReopenIntegrityReviewParams,
): Promise<ReopenIntegrityReviewResponse> {
  const response = await api.post<ReopenIntegrityReviewResponse>(
    bindUrlParams({
      path: ExposureGroupAssistantRoutes.INTEGRITY_REVIEW_REOPEN,
      pathParams: {
        companyId: params.companyId,
        workspaceId: params.workspaceId,
        elementId: params.elementId,
      },
    }),
    {
      findingKind: params.findingKind,
    },
  );
  return response.data;
}
