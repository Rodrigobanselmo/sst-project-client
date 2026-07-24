import {
  FrpsRiskAnalysisAiMinParticipants,
} from 'core/interfaces/api/IFrpsPrivacySettings';

/**
 * Confirmação obrigatória ao gravar mínimo 1 ou 2 (abaixo do padrão 3).
 * Aumento para 3 não exige alerta de assunção de risco.
 */
export function requiresFrpsRiskAnalysisPrivacyConfirmation(params: {
  current: FrpsRiskAnalysisAiMinParticipants;
  next: FrpsRiskAnalysisAiMinParticipants;
}): boolean {
  if (params.next === params.current) return false;
  return params.next < 3;
}
