import type { RunExposureGroupDiagnosisParams } from '../service/exposure-group-assistant.types';

export const exposureGroupAssistantQueryKeys = {
  all: ['exposure-group-assistant'] as const,
  diagnosis: (params: RunExposureGroupDiagnosisParams) =>
    [...exposureGroupAssistantQueryKeys.all, 'diagnosis', params] as const,
};
