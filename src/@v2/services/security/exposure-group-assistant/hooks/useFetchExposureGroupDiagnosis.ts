import { useFetch } from '@v2/hooks/api/useFetch';

import { runExposureGroupDiagnosis } from '../service/exposure-group-assistant.service';
import type { RunExposureGroupDiagnosisParams } from '../service/exposure-group-assistant.types';
import { exposureGroupAssistantQueryKeys } from './exposure-group-assistant.query-keys';

export const useFetchExposureGroupDiagnosis = (
  params: RunExposureGroupDiagnosisParams,
  enabled = true,
) => {
  return useFetch({
    queryKey: [...exposureGroupAssistantQueryKeys.diagnosis(params)],
    queryFn: () => runExposureGroupDiagnosis(params),
    enabled: enabled && Boolean(params.companyId && params.workspaceId),
    refetchOnMount: true,
  });
};
