import type {
  IndicatorsNarrativeDiagnosticResult,
  IndicatorsNarrativeDiagnosticScope,
} from './indicators-narrative-diagnostic.types';

const normalizeNullableString = (value?: string | null): string | null => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
};

/** Evita Boolean('false') === true ao normalizar escopos vindos de query/JSON. */
export const parseShowOnlyGroupIndicators = (value: unknown): boolean => {
  if (value === true || value === 1) return true;
  if (value === false || value === 0 || value == null) return false;

  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (['true', '1', 'yes', 'sim'].includes(normalized)) return true;
    if (['false', '0', 'no', 'não', 'nao', ''].includes(normalized)) return false;
  }

  return false;
};

export function normalizeIndicatorsNarrativeScope(
  scope: IndicatorsNarrativeDiagnosticScope,
): IndicatorsNarrativeDiagnosticScope {
  const participantGroupIds = Array.from(
    new Set((scope.participantGroupIds ?? []).map((id) => id?.trim()).filter(Boolean)),
  ).sort((a, b) => a.localeCompare(b, 'pt-BR'));

  return {
    groupingQuestionId: normalizeNullableString(scope.groupingQuestionId) ?? null,
    participantGroupIds,
    groupingLabel: normalizeNullableString(scope.groupingLabel),
    showOnlyGroupIndicators: parseShowOnlyGroupIndicators(scope.showOnlyGroupIndicators),
  };
}

export const buildIndicatorsNarrativeDiagnosticScopeKey = (
  scope: IndicatorsNarrativeDiagnosticScope,
): string => {
  const groupingPart = scope.groupingQuestionId ?? '_all_';
  const participantGroupIds = scope.participantGroupIds ?? [];
  const groupsPart =
    participantGroupIds.length > 0
      ? [...participantGroupIds].sort().join('|')
      : '_all_groups_';
  const viewPart = scope.showOnlyGroupIndicators ? 'groups_only' : 'groups_and_questions';

  return `${groupingPart}::${groupsPart}::view::${viewPart}`;
};

/** Impede exibir diagnóstico do outro modo (groups_only vs groups_and_questions). */
export const diagnosticMatchesViewMode = (
  result: IndicatorsNarrativeDiagnosticResult | null | undefined,
  showOnlyGroupIndicators: boolean,
): result is IndicatorsNarrativeDiagnosticResult => {
  if (!result?.scopeKey) return false;

  const expectedSuffix = showOnlyGroupIndicators
    ? '::view::groups_only'
    : '::view::groups_and_questions';

  return result.scopeKey.endsWith(expectedSuffix);
};
