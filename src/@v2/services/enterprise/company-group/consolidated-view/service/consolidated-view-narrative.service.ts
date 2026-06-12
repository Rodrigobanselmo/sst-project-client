import { bindUrlParams } from '@v2/utils/bind-ul-params';
import { api } from 'core/services/apiClient';

import { CompanyGroupRoutes } from '../../home-summary/constants/company-group.routes';
import {
  buildConsolidatedIndicatorsNarrativeScopeKey,
  consolidatedNarrativeMatchesViewMode,
  normalizeConsolidatedIndicatorsNarrativeScope,
} from './consolidated-view-narrative.scope';
import {
  ConsolidatedIndicatorsNarrativeDiagnosticResult,
  GenerateConsolidatedIndicatorsNarrativeDiagnosticParams,
  ReadConsolidatedIndicatorsNarrativeDiagnosticParams,
} from './consolidated-view-narrative.types';

export async function generateConsolidatedIndicatorsNarrativeDiagnostic({
  companyGroupId,
  applicationIds,
  ...body
}: GenerateConsolidatedIndicatorsNarrativeDiagnosticParams): Promise<ConsolidatedIndicatorsNarrativeDiagnosticResult> {
  const scope = normalizeConsolidatedIndicatorsNarrativeScope(body.scope);

  const response = await api.post<ConsolidatedIndicatorsNarrativeDiagnosticResult>(
    bindUrlParams({
      path: CompanyGroupRoutes.CONSOLIDATED_VIEW_INDICATORS_NARRATIVE_DIAGNOSTIC,
      pathParams: { companyGroupId },
    }),
    {
      ...body,
      scope,
      ...(applicationIds?.length ? { applicationIds } : {}),
    },
  );

  const data = response.data;
  if (!consolidatedNarrativeMatchesViewMode(data, scope.showOnlyGroupIndicators)) {
    throw new Error(
      'Resposta da narrativa consolidada não corresponde ao modo de visualização solicitado.',
    );
  }

  return data;
}

export async function readConsolidatedIndicatorsNarrativeDiagnostic({
  companyGroupId,
  applicationIds,
  scope,
}: ReadConsolidatedIndicatorsNarrativeDiagnosticParams): Promise<ConsolidatedIndicatorsNarrativeDiagnosticResult | null> {
  const normalizedScope = normalizeConsolidatedIndicatorsNarrativeScope(scope);
  const scopeKey = buildConsolidatedIndicatorsNarrativeScopeKey(normalizedScope, {
    companyGroupId,
    applicationIds: applicationIds ?? [],
  });

  const response = await api.get<ConsolidatedIndicatorsNarrativeDiagnosticResult | null>(
    bindUrlParams({
      path: CompanyGroupRoutes.CONSOLIDATED_VIEW_INDICATORS_NARRATIVE_DIAGNOSTIC,
      pathParams: { companyGroupId },
      queryParams: {
        ...(applicationIds?.length
          ? { applicationIds: applicationIds.join(',') }
          : {}),
        scopeKey,
        groupingMode: normalizedScope.groupingMode,
        participantGroupIds: normalizedScope.participantGroupIds?.length
          ? normalizedScope.participantGroupIds.join(',')
          : undefined,
        groupingLabel: normalizedScope.groupingLabel ?? undefined,
        showOnlyGroupIndicators: normalizedScope.showOnlyGroupIndicators
          ? 'true'
          : 'false',
      },
    }),
  );

  const data = response.data;
  if (!data) return null;

  if (
    !consolidatedNarrativeMatchesViewMode(
      data,
      normalizedScope.showOnlyGroupIndicators,
    )
  ) {
    return null;
  }

  return data;
}
