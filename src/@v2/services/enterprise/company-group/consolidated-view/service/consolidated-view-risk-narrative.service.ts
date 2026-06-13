import { bindUrlParams } from '@v2/utils/bind-ul-params';
import { api } from 'core/services/apiClient';

import { CompanyGroupRoutes } from '../../home-summary/constants/company-group.routes';
import {
  buildConsolidatedRiskNarrativeScopeKey,
  normalizeConsolidatedRiskNarrativeScope,
} from './consolidated-view-risk-narrative.scope';
import {
  ConsolidatedRiskNarrativeDiagnosticResult,
  GenerateConsolidatedRiskNarrativeDiagnosticParams,
  ReadConsolidatedRiskNarrativeDiagnosticParams,
} from './consolidated-view-risk-narrative.types';

export async function generateConsolidatedRiskNarrativeDiagnostic({
  companyGroupId,
  applicationIds,
  ...body
}: GenerateConsolidatedRiskNarrativeDiagnosticParams): Promise<ConsolidatedRiskNarrativeDiagnosticResult> {
  const scope = normalizeConsolidatedRiskNarrativeScope(body.scope);

  const response = await api.post<ConsolidatedRiskNarrativeDiagnosticResult>(
    bindUrlParams({
      path: CompanyGroupRoutes.CONSOLIDATED_VIEW_RISK_NARRATIVE_DIAGNOSTIC,
      pathParams: { companyGroupId },
    }),
    {
      ...body,
      scope,
      ...(applicationIds?.length ? { applicationIds } : {}),
    },
  );

  return response.data;
}

export async function readConsolidatedRiskNarrativeDiagnostic({
  companyGroupId,
  applicationIds,
  scope,
}: ReadConsolidatedRiskNarrativeDiagnosticParams): Promise<ConsolidatedRiskNarrativeDiagnosticResult | null> {
  const normalizedScope = normalizeConsolidatedRiskNarrativeScope(scope);
  const scopeKey = buildConsolidatedRiskNarrativeScopeKey(normalizedScope, {
    companyGroupId,
    applicationIds: applicationIds ?? [],
  });

  const response = await api.get<ConsolidatedRiskNarrativeDiagnosticResult | null>(
    bindUrlParams({
      path: CompanyGroupRoutes.CONSOLIDATED_VIEW_RISK_NARRATIVE_DIAGNOSTIC,
      pathParams: { companyGroupId },
      queryParams: {
        ...(applicationIds?.length
          ? { applicationIds: applicationIds.join(',') }
          : {}),
        scopeKey,
        groupingMode: normalizedScope.groupingMode,
        companyId: normalizedScope.filters.companyId ?? undefined,
        formApplicationId: normalizedScope.filters.formApplicationId ?? undefined,
        riskLevel: normalizedScope.filters.riskLevel ?? undefined,
        status: normalizedScope.filters.status ?? undefined,
        search: normalizedScope.filters.search ?? undefined,
      },
    }),
  );

  return response.data;
}
