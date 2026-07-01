import { RiskTypeEnum } from '@v2/models/security/enums/risk-type.enum';
import type { IRiskSubtypeCurationSuggestCandidate } from '@v2/services/security/risk/sub-type/risk-subtype-curation/risk-subtype-curation.types';

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
