import { ExposureGroupAssistantRoutes } from '@v2/constants/routes/exposure-group-assistant.routes';
import { bindUrlParams } from '@v2/utils/bind-ul-params';
import { api } from 'core/services/apiClient';

import type {
  AnalyzeDevelopedRoleDeletionParams,
  BulkJustifyIntegrityReviewExecuteParams,
  BulkJustifyIntegrityReviewParams,
  BulkJustifyPreviewResponse,
  BulkJustifyResponse,
  CreateGseFromProposalParams,
  CreateGseFromProposalResult,
  CreateGsePreviewParams,
  CreateGsePreviewResult,
  DeleteDevelopedRoleParams,
  DeleteDevelopedRoleResult,
  DevelopedRoleDeletionAnalysis,
  ExposureGroupAssistantDiagnosisResponse,
  JustifyIntegrityReviewParams,
  JustifyIntegrityReviewResponse,
  RefineGseDraftBody,
  RefineGseDraftParams,
  RefineGseDraftResult,
  ReopenIntegrityReviewParams,
  ReopenIntegrityReviewResponse,
  RunExposureGroupDiagnosisParams,
  RunSimilarityProposalsParams,
  SimilarityProposalsResponse,
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

export async function runSimilarityProposals(
  params: RunSimilarityProposalsParams,
): Promise<SimilarityProposalsResponse> {
  const response = await api.post<SimilarityProposalsResponse>(
    bindUrlParams({
      path: ExposureGroupAssistantRoutes.SIMILARITY_PROPOSALS,
      pathParams: {
        companyId: params.companyId,
        workspaceId: params.workspaceId,
      },
    }),
    {
      confidence: params.confidence,
      elementTypes: params.elementTypes,
      nameQuery: params.nameQuery,
      withoutBlocksOnly: params.withoutBlocksOnly,
      commonAncestorId: params.commonAncestorId,
      displayLimit: params.displayLimit,
      proposalMode: params.proposalMode,
    },
  );
  return response.data;
}

function buildRefineGseDraftBody(
  params: RefineGseDraftParams,
): RefineGseDraftBody {
  const { draft, riskNameById } = params;
  return {
    proposalId: draft.proposalId,
    proposalMode: draft.proposalMode,
    classification: draft.classification,
    name: draft.name,
    description: draft.description,
    technicalJustification: draft.technicalJustification,
    formationReason: draft.formationReason,
    populationDescription: draft.populationDescription,
    operationalContext: draft.operationalContext,
    occupationalContext: draft.occupationalContext,
    inclusionCriteria: draft.inclusionCriteria,
    exclusionCriteria: draft.exclusionCriteria,
    reviewNotes: draft.reviewNotes,
    includedElements: draft.includedElements.map((el) => ({
      elementId: el.elementId,
      name: el.name,
      type: el.type,
      coveredEmployeeCount: el.coveredEmployeeCount,
      riskCount: el.riskCount,
    })),
    includedJobs: draft.includedJobs,
    riskIds: draft.includedRisks.riskIds,
    riskNameById,
    includedEmployees: draft.includedEmployees,
    score: draft.score,
    confidence: draft.confidence,
    warnings: draft.warnings,
  };
}

export async function refineGseDraft(
  params: RefineGseDraftParams,
): Promise<RefineGseDraftResult> {
  const response = await api.post<RefineGseDraftResult>(
    bindUrlParams({
      path: ExposureGroupAssistantRoutes.SIMILARITY_PROPOSALS_REFINE_DRAFT,
      pathParams: {
        companyId: params.companyId,
        workspaceId: params.workspaceId,
      },
    }),
    buildRefineGseDraftBody(params),
  );
  return response.data;
}

export async function previewCreateGseFromProposal(
  params: CreateGsePreviewParams,
): Promise<CreateGsePreviewResult> {
  const response = await api.post<CreateGsePreviewResult>(
    bindUrlParams({
      path: ExposureGroupAssistantRoutes.SIMILARITY_PROPOSALS_CREATE_PREVIEW,
      pathParams: {
        companyId: params.companyId,
        workspaceId: params.workspaceId,
      },
    }),
    params.body,
  );
  return response.data;
}

export async function createGseFromProposal(
  params: CreateGseFromProposalParams,
): Promise<CreateGseFromProposalResult> {
  const response = await api.post<CreateGseFromProposalResult>(
    bindUrlParams({
      path: ExposureGroupAssistantRoutes.SIMILARITY_PROPOSALS_CREATE,
      pathParams: {
        companyId: params.companyId,
        workspaceId: params.workspaceId,
      },
    }),
    params.body,
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

function bulkJustifyBody(params: BulkJustifyIntegrityReviewParams) {
  return {
    operationalBucket: params.operationalBucket ?? 'PENDING',
    category: params.category ?? 'ALL',
    attentionLevel: params.attentionLevel ?? 'ALL',
    stance: params.stance ?? 'ALL',
    entityQuery: params.entityQuery ?? '',
    existingGseOnly: Boolean(params.existingGseOnly),
  };
}

export async function previewBulkJustifyIntegrityReview(
  params: BulkJustifyIntegrityReviewParams,
): Promise<BulkJustifyPreviewResponse> {
  const response = await api.post<BulkJustifyPreviewResponse>(
    bindUrlParams({
      path: ExposureGroupAssistantRoutes.INTEGRITY_REVIEW_BULK_JUSTIFY_PREVIEW,
      pathParams: {
        companyId: params.companyId,
        workspaceId: params.workspaceId,
      },
    }),
    bulkJustifyBody(params),
  );
  return response.data;
}

export async function bulkJustifyIntegrityReview(
  params: BulkJustifyIntegrityReviewExecuteParams,
): Promise<BulkJustifyResponse> {
  const response = await api.post<BulkJustifyResponse>(
    bindUrlParams({
      path: ExposureGroupAssistantRoutes.INTEGRITY_REVIEW_BULK_JUSTIFY,
      pathParams: {
        companyId: params.companyId,
        workspaceId: params.workspaceId,
      },
    }),
    {
      ...bulkJustifyBody(params),
      reason: params.reason,
      selectionFingerprint: params.selectionFingerprint,
      eligibleElementIds: params.eligibleElementIds,
    },
  );
  return response.data;
}
