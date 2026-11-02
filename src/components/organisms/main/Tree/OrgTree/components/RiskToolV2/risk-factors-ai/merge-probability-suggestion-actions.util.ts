import type { RiskFactorAiSuggestionActions } from './useRiskFactorAiSuggestionActions';

/** Preserve joint-analysis cards in editors; exact occurrence only, canonical actions win duplicates. */
export function mergeProbabilitySuggestionActions(
  primary: RiskFactorAiSuggestionActions,
  fallback?: RiskFactorAiSuggestionActions,
): RiskFactorAiSuggestionActions {
  if (!fallback) return primary;
  const fallbackPending: RiskFactorAiSuggestionActions['pendingFor'] = (
    params,
  ) =>
    params.column === 'probability' && params.riskData?.id
      ? fallback
          .pendingFor(params)
          .filter(
            (item) =>
              item.riskFactorDataId === params.riskData!.id &&
              item.riskId === params.riskId &&
              item.field === 'probability' &&
              !primary.resolvedKeys?.has(item.key),
          )
      : [];
  return {
    applyingKey: primary.applyingKey || fallback.applyingKey,
    resolvedKeys: primary.resolvedKeys,
    pendingFor: (params) => {
      const own = primary.pendingFor(params);
      const keys = new Set(own.map((item) => item.key));
      return [
        ...own,
        ...fallbackPending(params).filter((item) => !keys.has(item.key)),
      ];
    },
    // Even joint-analysis cards use the occurrence adapter for confirmation/revalidation here.
    accept: primary.accept,
    dismiss: primary.dismiss,
  };
}
