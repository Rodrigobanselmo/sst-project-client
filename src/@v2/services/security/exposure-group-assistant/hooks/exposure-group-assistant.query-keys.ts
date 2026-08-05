import type {
  AnalyzeDevelopedRoleDeletionParams,
  RunExposureGroupDiagnosisParams,
  RunSimilarityProposalsParams,
} from '../service/exposure-group-assistant.types';

export const exposureGroupAssistantQueryKeys = {
  all: ['exposure-group-assistant'] as const,
  diagnosis: (params: RunExposureGroupDiagnosisParams) =>
    [...exposureGroupAssistantQueryKeys.all, 'diagnosis', params] as const,
  similarityProposals: (params: RunSimilarityProposalsParams) =>
    [
      ...exposureGroupAssistantQueryKeys.all,
      'similarity-proposals',
      params,
    ] as const,
  developedRoleDeletionEligibility: (
    params: AnalyzeDevelopedRoleDeletionParams,
  ) =>
    [
      ...exposureGroupAssistantQueryKeys.all,
      'developed-role-deletion-eligibility',
      params,
    ] as const,
};
