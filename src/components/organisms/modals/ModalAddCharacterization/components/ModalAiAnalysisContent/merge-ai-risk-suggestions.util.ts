import { DetailedRisk } from '@v2/services/security/characterization/characterization/ai-analyze-characterization/service/ai-analyze-characterization.types';

export function mergeAiRiskSuggestions(params: {
  existing: DetailedRisk[];
  incoming: DetailedRisk[];
  dismissedRiskIds: string[];
}): DetailedRisk[] {
  const dismissed = new Set(params.dismissedRiskIds);
  const byId = new Map<string, DetailedRisk>();

  for (const risk of params.existing) {
    if (!dismissed.has(risk.id)) {
      byId.set(risk.id, risk);
    }
  }

  for (const risk of params.incoming) {
    if (dismissed.has(risk.id) || byId.has(risk.id)) {
      continue;
    }
    byId.set(risk.id, risk);
  }

  return Array.from(byId.values());
}
