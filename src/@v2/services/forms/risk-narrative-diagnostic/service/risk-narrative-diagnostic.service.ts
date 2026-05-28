import { FormRoutes } from '@v2/constants/routes/forms.routes';
import { bindUrlParams } from '@v2/utils/bind-ul-params';
import { api } from 'core/services/apiClient';
import {
  GenerateRiskNarrativeDiagnosticParams,
  ReadRiskNarrativeDiagnosticParams,
  RiskNarrativeDiagnosticResult,
} from './risk-narrative-diagnostic.types';

export async function generateRiskNarrativeDiagnostic({
  companyId,
  formApplicationId,
  ...body
}: GenerateRiskNarrativeDiagnosticParams): Promise<RiskNarrativeDiagnosticResult> {
  const response = await api.post<RiskNarrativeDiagnosticResult>(
    bindUrlParams({
      path: FormRoutes.FORM_QUESTIONS_ANSWERS.RISK_NARRATIVE_DIAGNOSTIC,
      pathParams: { companyId, applicationId: formApplicationId },
    }),
    body,
  );

  return response.data;
}

export async function readRiskNarrativeDiagnostic({
  companyId,
  formApplicationId,
  scope,
}: ReadRiskNarrativeDiagnosticParams): Promise<RiskNarrativeDiagnosticResult | null> {
  const response = await api.get<RiskNarrativeDiagnosticResult | null>(
    bindUrlParams({
      path: FormRoutes.FORM_QUESTIONS_ANSWERS.RISK_NARRATIVE_DIAGNOSTIC,
      pathParams: { companyId, applicationId: formApplicationId },
    }),
    {
      params: {
        groupingQuestionId: scope.groupingQuestionId ?? undefined,
        participantGroupIds: scope.participantGroupIds?.length
          ? scope.participantGroupIds.join(',')
          : undefined,
        allowedHierarchyIds: scope.allowedHierarchyIds?.length
          ? scope.allowedHierarchyIds.join(',')
          : undefined,
        groupingLabel: scope.groupingLabel ?? undefined,
      },
    },
  );

  return response.data;
}
