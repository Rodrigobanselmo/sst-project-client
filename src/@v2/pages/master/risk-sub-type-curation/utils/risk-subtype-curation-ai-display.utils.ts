import type { IRiskSubtypeCurationSuggestCandidate } from '@v2/services/security/risk/sub-type/risk-subtype-curation/risk-subtype-curation.types';

const GENERIC_WARNING_PATTERNS = [
  /não classificado pela ia nesta execução/i,
  /sem evidência suficiente na resposta da ia/i,
];

export type CandidateDecisionDisplay = {
  label: string;
  detail: string;
  chipColor: 'success' | 'warning' | 'default' | 'error';
  tone: 'include' | 'exclude' | 'review';
};

export function isGenericAiWarning(warning: string): boolean {
  const value = warning.trim();
  if (!value) return true;
  return GENERIC_WARNING_PATTERNS.some((pattern) => pattern.test(value));
}

export function getVisibleCandidateWarnings(warnings: string[]): string[] {
  return warnings.filter((warning) => !isGenericAiWarning(warning));
}

export function getCandidateDecisionDisplay(
  candidate: Pick<
    IRiskSubtypeCurationSuggestCandidate,
    'suggestedInclude' | 'confidence'
  >,
): CandidateDecisionDisplay {
  if (candidate.suggestedInclude) {
    if (candidate.confidence === 'high') {
      return {
        label: 'Incluir',
        detail: 'Alta confiança na decisão',
        chipColor: 'success',
        tone: 'include',
      };
    }
    if (candidate.confidence === 'medium') {
      return {
        label: 'Incluir',
        detail: 'Média confiança na decisão',
        chipColor: 'warning',
        tone: 'include',
      };
    }
    return {
      label: 'Incluir',
      detail: 'Baixa confiança — revisar',
      chipColor: 'default',
      tone: 'review',
    };
  }

  if (candidate.confidence === 'high') {
    return {
      label: 'Excluído',
      detail: 'Alta confiança na exclusão',
      chipColor: 'default',
      tone: 'exclude',
    };
  }
  if (candidate.confidence === 'medium') {
    return {
      label: 'Excluído',
      detail: 'Média confiança na exclusão',
      chipColor: 'default',
      tone: 'exclude',
    };
  }

  return {
    label: 'Revisar',
    detail: 'Baixa confiança na decisão',
    chipColor: 'default',
    tone: 'review',
  };
}

export function isLowConfidenceCandidate(
  candidate: Pick<IRiskSubtypeCurationSuggestCandidate, 'confidence'>,
): boolean {
  return candidate.confidence === 'low';
}

export function isSuggestedIncludeCandidate(
  candidate: Pick<IRiskSubtypeCurationSuggestCandidate, 'suggestedInclude' | 'confidence'>,
): boolean {
  return candidate.suggestedInclude && candidate.confidence !== 'low';
}

export function isExcludedWithConfidenceCandidate(
  candidate: Pick<IRiskSubtypeCurationSuggestCandidate, 'suggestedInclude' | 'confidence'>,
): boolean {
  return (
    !candidate.suggestedInclude &&
    (candidate.confidence === 'high' || candidate.confidence === 'medium')
  );
}

export function hasExternalChemicalIdentity(
  candidate: Pick<IRiskSubtypeCurationSuggestCandidate, 'chemicalIdentity'>,
): boolean {
  return Boolean(candidate.chemicalIdentity?.sources?.length);
}

export function buildChemicalIdentityTooltip(
  chemicalIdentity: NonNullable<IRiskSubtypeCurationSuggestCandidate['chemicalIdentity']>,
): string {
  const lines = [
    chemicalIdentity.title,
    chemicalIdentity.molecularFormula
      ? `Fórmula: ${chemicalIdentity.molecularFormula}`
      : null,
    chemicalIdentity.classHints?.length
      ? `Classes: ${chemicalIdentity.classHints.join(', ')}`
      : null,
    chemicalIdentity.matchedBy
      ? `Correspondência: ${chemicalIdentity.matchedBy}`
      : null,
  ].filter(Boolean);
  return lines.join('\n');
}

export const ENRICHMENT_PARTIAL_WARNING =
  'Alguns riscos foram analisados apenas com dados internos';

export function matchesCandidateModalFilters(
  candidate: IRiskSubtypeCurationSuggestCandidate,
  filters: {
    showSuggestedInclude: boolean;
    showExcluded: boolean;
    showLowConfidence: boolean;
    search: string;
  },
): boolean {
  const search = filters.search.trim().toLowerCase();
  const isLow = isLowConfidenceCandidate(candidate);
  const isInclude = isSuggestedIncludeCandidate(candidate);
  const isExcluded = isExcludedWithConfidenceCandidate(candidate);

  const inSegment =
    (filters.showSuggestedInclude && isInclude) ||
    (filters.showExcluded && isExcluded) ||
    (filters.showLowConfidence && isLow);

  if (!inSegment) return false;
  if (!search) return true;

  return (
    candidate.name.toLowerCase().includes(search) ||
    (candidate.cas ?? '').toLowerCase().includes(search) ||
    (candidate.esocialCode ?? '').toLowerCase().includes(search)
  );
}
