import { FormRoutes } from '@v2/constants/routes/forms.routes';
import { bindUrlParams } from '@v2/utils/bind-ul-params';
import { api } from 'core/services/apiClient';
import {
  GenerateIndicatorsNarrativeDiagnosticParams,
  ReadIndicatorsNarrativeDiagnosticParams,
  IndicatorsNarrativeDiagnosticResult,
} from './indicators-narrative-diagnostic.types';
import {
  buildIndicatorsNarrativeDiagnosticScopeKey,
  diagnosticMatchesViewMode,
  normalizeIndicatorsNarrativeScope,
} from './indicators-narrative-diagnostic.scope';

export async function generateIndicatorsNarrativeDiagnostic({
  companyId,
  formApplicationId,
  ...body
}: GenerateIndicatorsNarrativeDiagnosticParams): Promise<IndicatorsNarrativeDiagnosticResult> {
  const scope = normalizeIndicatorsNarrativeScope(body.scope);
  const response = await api.post<IndicatorsNarrativeDiagnosticResult>(
    bindUrlParams({
      path: FormRoutes.FORM_QUESTIONS_ANSWERS.INDICATORS_NARRATIVE_DIAGNOSTIC,
      pathParams: { companyId, applicationId: formApplicationId },
    }),
    { ...body, scope },
  );

  const data = response.data;
  if (!diagnosticMatchesViewMode(data, scope.showOnlyGroupIndicators)) {
    throw new Error(
      'Resposta do diagnóstico narrativo não corresponde ao modo de visualização solicitado.',
    );
  }

  return data;
}

export async function readIndicatorsNarrativeDiagnostic({
  companyId,
  formApplicationId,
  scope,
}: ReadIndicatorsNarrativeDiagnosticParams): Promise<IndicatorsNarrativeDiagnosticResult | null> {
  const normalizedScope = normalizeIndicatorsNarrativeScope(scope);
  const scopeKey = buildIndicatorsNarrativeDiagnosticScopeKey(normalizedScope);

  const response = await api.get<IndicatorsNarrativeDiagnosticResult | null>(
    bindUrlParams({
      path: FormRoutes.FORM_QUESTIONS_ANSWERS.INDICATORS_NARRATIVE_DIAGNOSTIC,
      pathParams: { companyId, applicationId: formApplicationId },
    }),
    {
      params: {
        scopeKey,
        groupingQuestionId: normalizedScope.groupingQuestionId ?? undefined,
        participantGroupIds: normalizedScope.participantGroupIds?.length
          ? normalizedScope.participantGroupIds.join(',')
          : undefined,
        groupingLabel: normalizedScope.groupingLabel ?? undefined,
        showOnlyGroupIndicators: normalizedScope.showOnlyGroupIndicators
          ? 'true'
          : 'false',
      },
    },
  );

  const data = response.data;
  if (!data) return null;

  if (!diagnosticMatchesViewMode(data, normalizedScope.showOnlyGroupIndicators)) {
    return null;
  }

  return data;
}
