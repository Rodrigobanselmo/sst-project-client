import { RiskTypeEnum } from '@v2/models/security/enums/risk-type.enum';
import type {
  IRiskSubtypeCurationSuggestCandidate,
  ISuggestRiskSubtypeCandidatesResponse,
} from '@v2/services/security/risk/sub-type/risk-subtype-curation/risk-subtype-curation.types';

export function canEnableAiSuggestButton(
  riskType: RiskTypeEnum,
  selectedSubtypeId: number | '',
): boolean {
  return riskType === RiskTypeEnum.QUI && selectedSubtypeId !== '';
}

export function getDefaultSelectedCandidateIds(
  candidates: Pick<IRiskSubtypeCurationSuggestCandidate, 'riskFactorId' | 'defaultSelected'>[],
): string[] {
  return candidates
    .filter((candidate) => candidate.defaultSelected)
    .map((candidate) => candidate.riskFactorId);
}

export function formatAiSuggestErrorMessage(error: unknown): string {
  const fallback =
    'Não foi possível gerar sugestões de IA. Verifique a configuração da API ou tente novamente.';
  if (!error || typeof error !== 'object') return fallback;
  const response = (error as { response?: { data?: { message?: string | string[] } } })
    .response;
  const message = response?.data?.message;
  if (typeof message === 'string' && message.trim()) return message;
  if (Array.isArray(message) && message.length) return message.join(' ');
  return fallback;
}

function buildSummaryFromCandidates(
  candidates: IRiskSubtypeCurationSuggestCandidate[],
) {
  const hasConfidence = (confidence: 'high' | 'medium' | 'low') =>
    confidence === 'high' || confidence === 'medium';

  return {
    suggestedInclude: candidates.filter((c) => c.suggestedInclude).length,
    suggestedExclude: candidates.filter((c) => !c.suggestedInclude).length,
    lowConfidence: candidates.filter((c) => c.confidence === 'low').length,
    includedWithConfidence: candidates.filter(
      (c) => c.suggestedInclude && hasConfidence(c.confidence),
    ).length,
    excludedWithConfidence: candidates.filter(
      (c) => !c.suggestedInclude && hasConfidence(c.confidence),
    ).length,
  };
}

export function mergeSuggestBatchResponses(
  previous: ISuggestRiskSubtypeCandidatesResponse,
  next: ISuggestRiskSubtypeCandidatesResponse,
): ISuggestRiskSubtypeCandidatesResponse {
  const existingIds = new Set(
    previous.candidates.map((candidate) => candidate.riskFactorId),
  );
  const newCandidates = next.candidates.filter(
    (candidate) => !existingIds.has(candidate.riskFactorId),
  );
  const mergedCandidates = [...previous.candidates, ...newCandidates];
  const previousCumulative =
    previous.scope.cumulativeAnalyzed ?? previous.scope.analyzed;
  const cumulativeAnalyzed = previousCumulative + next.scope.analyzed;
  const batchesLoaded = (previous.scope.batchesLoaded ?? 1) + 1;

  const mergedEnrichment =
    previous.enrichment || next.enrichment
      ? {
          attempted:
            (previous.enrichment?.attempted ?? 0) +
            (next.enrichment?.attempted ?? 0),
          enriched:
            (previous.enrichment?.enriched ?? 0) +
            (next.enrichment?.enriched ?? 0),
          failed:
            (previous.enrichment?.failed ?? 0) + (next.enrichment?.failed ?? 0),
          sources: [
            ...new Set([
              ...(previous.enrichment?.sources ?? []),
              ...(next.enrichment?.sources ?? []),
            ]),
          ],
        }
      : undefined;

  return {
    ...next,
    candidates: mergedCandidates,
    summary: buildSummaryFromCandidates(mergedCandidates),
    warnings: [...new Set([...previous.warnings, ...next.warnings])],
    enrichment: mergedEnrichment,
    scope: {
      ...next.scope,
      cumulativeAnalyzed,
      batchesLoaded,
    },
  };
}

export function formatSuggestBatchLabel(
  scope: ISuggestRiskSubtypeCandidatesResponse['scope'],
): string {
  if (!scope.rangeEnd) {
    return `Lote ${scope.page} — nenhum elegível neste recorte`;
  }
  return `Lote ${scope.page} — analisando ${scope.rangeStart}–${scope.rangeEnd} de ${scope.eligibleTotal}`;
}

export function parseSubtypeNameTags(name: string): {
  title: string;
  tags: string[];
} {
  const tags = [...name.matchAll(/\[([^\]]+)\]/g)].map((match) => match[0]);
  const title = name.replace(/\s*\[[^\]]+\]/g, '').trim() || name;
  return { title, tags };
}
