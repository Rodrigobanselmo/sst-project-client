import { ExposureGroupAssistantRoutes } from '@v2/constants/routes/exposure-group-assistant.routes';
import { bindUrlParams } from '@v2/utils/bind-ul-params';
import { api } from 'core/services/apiClient';

import type {
  ExposureGroupAssistantDiagnosisResponse,
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
