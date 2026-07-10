import {
  AiTemporaryDocumentSource,
  DetailedRisk,
  ExistingRiskReview,
} from '@v2/services/security/characterization/characterization/ai-analyze-characterization/service/ai-analyze-characterization.types';

export type AiRiskAnalysisSessionSnapshot = {
  suggestions: DetailedRisk[];
  existingRiskReviews: ExistingRiskReview[];
  addedRiskIds: string[];
  dismissedRiskIds: string[];
  modifiedRisks: Record<string, DetailedRisk>;
  userGuidance: string;
  /**
   * Optional temporary PDF text/meta for this browser session only.
   * Never stores the binary PDF; never uses localStorage.
   */
  temporaryDocumentSource: AiTemporaryDocumentSource | null;
  /** Suggestion accordion ids the user left expanded in this browser session. */
  expandedSuggestionIds: string[];
  appliedModularSuggestionKeys: string[];
  /** True after at least one AI analysis merge in this browser session. */
  hasAnalyzed: boolean;
};

export type AiRiskAnalysisSessionKeyParams = {
  characterizationId?: string;
  riskGroupId?: string;
  companyId?: string;
  workspaceId?: string;
};

const STORAGE_PREFIX = 'characterization-ai-risk-analysis';

function normalizeTemporaryDocumentSource(
  value: unknown,
): AiTemporaryDocumentSource | null {
  if (!value || typeof value !== 'object') return null;
  const source = value as Partial<AiTemporaryDocumentSource>;
  if (
    source.kind !== 'user_pdf' ||
    typeof source.fileName !== 'string' ||
    typeof source.extractedText !== 'string' ||
    !source.extractedText.trim()
  ) {
    return null;
  }
  return {
    kind: 'user_pdf',
    fileName: source.fileName,
    extractedText: source.extractedText,
    charCount:
      typeof source.charCount === 'number' ? source.charCount : undefined,
    truncated:
      typeof source.truncated === 'boolean' ? source.truncated : undefined,
    pageCount:
      typeof source.pageCount === 'number' ? source.pageCount : undefined,
  };
}

export function buildAiRiskAnalysisSessionKey(
  params: AiRiskAnalysisSessionKeyParams,
): string | null {
  const characterizationId = params.characterizationId?.trim();
  const riskGroupId = params.riskGroupId?.trim();
  if (!characterizationId || !riskGroupId) return null;

  const companyId = params.companyId?.trim() || 'unknown-company';
  const workspaceId = params.workspaceId?.trim() || 'unknown-workspace';

  return [
    STORAGE_PREFIX,
    companyId,
    workspaceId,
    characterizationId,
    riskGroupId,
  ].join(':');
}

export function readAiRiskAnalysisSession(
  key: string | null,
): AiRiskAnalysisSessionSnapshot | null {
  if (!key || typeof window === 'undefined') return null;

  try {
    const raw = window.sessionStorage.getItem(key);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<AiRiskAnalysisSessionSnapshot>;
    if (!parsed || typeof parsed !== 'object') return null;

    return {
      suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : [],
      existingRiskReviews: Array.isArray(parsed.existingRiskReviews)
        ? parsed.existingRiskReviews
        : [],
      addedRiskIds: Array.isArray(parsed.addedRiskIds)
        ? parsed.addedRiskIds
        : [],
      dismissedRiskIds: Array.isArray(parsed.dismissedRiskIds)
        ? parsed.dismissedRiskIds
        : [],
      modifiedRisks:
        parsed.modifiedRisks && typeof parsed.modifiedRisks === 'object'
          ? parsed.modifiedRisks
          : {},
      userGuidance:
        typeof parsed.userGuidance === 'string' ? parsed.userGuidance : '',
      temporaryDocumentSource: normalizeTemporaryDocumentSource(
        parsed.temporaryDocumentSource,
      ),
      expandedSuggestionIds: Array.isArray(parsed.expandedSuggestionIds)
        ? parsed.expandedSuggestionIds.filter(
            (id): id is string => typeof id === 'string' && !!id,
          )
        : [],
      appliedModularSuggestionKeys: Array.isArray(
        parsed.appliedModularSuggestionKeys,
      )
        ? parsed.appliedModularSuggestionKeys.filter(
            (id): id is string => typeof id === 'string' && !!id,
          )
        : [],
      hasAnalyzed: parsed.hasAnalyzed === true,
    };
  } catch {
    return null;
  }
}

export function writeAiRiskAnalysisSession(
  key: string | null,
  snapshot: AiRiskAnalysisSessionSnapshot,
): void {
  if (!key || typeof window === 'undefined') return;

  try {
    window.sessionStorage.setItem(key, JSON.stringify(snapshot));
  } catch {
    // Ignore quota / private-mode failures; in-memory state remains valid.
  }
}

/** Clears only the AI analysis session snapshot for one characterization/group. */
export function clearAiRiskAnalysisSession(key: string | null): void {
  if (!key || typeof window === 'undefined') return;
  try {
    window.sessionStorage.removeItem(key);
  } catch {
    // ignore
  }
}
