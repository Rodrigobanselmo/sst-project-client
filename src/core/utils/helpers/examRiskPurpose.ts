export const examRiskPurposes = {
  BIOLOGICAL_MONITORING: 'Monitoramento biológico',
  FITNESS_FOR_ROLE: 'Avaliação de aptidão para a função',
  FITNESS_FOR_SPECIFIC_ACTIVITY:
    'Avaliação de aptidão para atividade específica',
  OCCUPATIONAL_HEALTH_SURVEILLANCE: 'Vigilância da saúde ocupacional',
  SANITARY_COMPLIANCE: 'Exigência sanitária',
  CONDITIONAL_REQUIREMENT: 'Exigência condicional',
  POST_EXPOSURE_OR_CLINICAL: 'Pós-exposição ou avaliação clínica',
  NOT_APPLICABLE: 'Não aplicável',
  INSUFFICIENT_CONTEXT: 'Contexto insuficiente',
  OTHER: 'Outra finalidade',
};

export function purposeNeedsDescription(purpose: unknown) {
  return purpose === 'OTHER' || purpose === 'FITNESS_FOR_SPECIFIC_ACTIVITY';
}

export function formatExamRiskPurpose(
  purpose?: string | null,
  rationale?: string | null,
) {
  if (!purpose) return 'Não informada';
  const label =
    examRiskPurposes[purpose as keyof typeof examRiskPurposes] ?? purpose;
  return purposeNeedsDescription(purpose) && rationale
    ? `${label} · ${rationale}`
    : label;
}

export function parseExamRiskPurposeDraft(
  draft: Record<string, string | boolean>,
) {
  const raw = draft.recommendationPurpose;
  if (
    typeof raw !== 'string' ||
    (raw && !Object.prototype.hasOwnProperty.call(examRiskPurposes, raw))
  )
    throw new Error('Selecione uma finalidade válida.');
  const rationale = draft.recommendationRationale;
  const description = typeof rationale === 'string' ? rationale.trim() : '';
  if (description.length > 2000)
    throw new Error('A descrição deve ter até 2000 caracteres.');
  if (raw === 'OTHER' && !description)
    throw new Error('Descreva a finalidade.');
  return {
    recommendationPurpose: raw || null,
    ...(purposeNeedsDescription(raw)
      ? { recommendationRationale: description || null }
      : {}),
  };
}
