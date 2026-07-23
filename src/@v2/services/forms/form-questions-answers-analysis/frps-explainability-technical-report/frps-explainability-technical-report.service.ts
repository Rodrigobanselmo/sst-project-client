import { bindUrlParams } from '@v2/utils/bind-ul-params';
import { api } from 'core/services/apiClient';
import { FormRoutes } from '@v2/constants/routes/forms.routes';

import type {
  FrpsExplainabilityTechnicalReportResult,
  ReadFrpsExplainabilityTechnicalReportParams,
} from './frps-explainability-technical-report.types';

export async function readFrpsExplainabilityTechnicalReport({
  companyId,
  applicationId,
  hierarchyIds,
  groupingLabel,
  recorteLabel,
}: ReadFrpsExplainabilityTechnicalReportParams): Promise<FrpsExplainabilityTechnicalReportResult> {
  const response = await api.get<FrpsExplainabilityTechnicalReportResult>(
    bindUrlParams({
      path: FormRoutes.FORM_QUESTIONS_ANSWERS.EXPLAINABILITY_TECHNICAL_REPORT,
      pathParams: { companyId, applicationId },
    }),
    {
      params: {
        hierarchyIds: hierarchyIds?.length ? hierarchyIds.join(',') : undefined,
        groupingLabel: groupingLabel ?? undefined,
        recorteLabel: recorteLabel ?? undefined,
      },
    },
  );

  return response.data;
}
