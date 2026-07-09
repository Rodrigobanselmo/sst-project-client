import { DetailedRisk } from '@v2/services/security/characterization/characterization/ai-analyze-characterization/service/ai-analyze-characterization.types';

export type AiRiskAnalysisSessionSnapshot = {
  suggestions: DetailedRisk[];
  addedRiskIds: string[];
  dismissedRiskIds: string[];
  modifiedRisks: Record<string, DetailedRisk>;
  userGuidance: string;
};

export type AiRiskAnalysisSessionKeyParams = {
  characterizationId?: string;
  riskGroupId?: string;
  companyId?: string;
  workspaceId?: string;
};

const STORAGE_PREFIX = 'characterization-ai-risk-analysis';

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
