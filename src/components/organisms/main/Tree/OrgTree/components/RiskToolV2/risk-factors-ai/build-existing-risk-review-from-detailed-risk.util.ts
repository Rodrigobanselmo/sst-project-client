import type {
  AiRiskFieldSuggestion,
  DetailedRisk,
  ExistingRiskReview,
} from '@v2/services/security/characterization/characterization/ai-analyze-characterization/service/ai-analyze-characterization.types';

function cleanTexts(values: string[] | undefined): string[] {
  return (values || [])
    .map((value) => value?.trim())
    .filter((value): value is string => !!value);
}

/**
 * Transfere sugestões de um risco novo (DetailedRisk) para o formato de
 * revisão modular usado pelas colunas pendentes — sem persistir nada.
 */
export function buildExistingRiskReviewFromDetailedRisk(params: {
  risk: DetailedRisk;
  riskFactorDataId?: string;
}): ExistingRiskReview {
  const { risk, riskFactorDataId } = params;
  const suggestions: AiRiskFieldSuggestion[] = [];
  const rationale = risk.explanation?.trim() || undefined;

  const source = risk.generateSource?.trim();
  if (source) {
    suggestions.push({
      field: 'generateSource',
      suggestedValues: [source],
      applyMode: 'append',
      rationale,
      intent: 'identificado',
    });
  }

  const existingEng = cleanTexts(risk.existingEngineeringMeasures);
  if (existingEng.length) {
    suggestions.push({
      field: 'existingEngineeringMeasures',
      suggestedValues: existingEng,
      applyMode: 'append',
      rationale,
      intent: 'verificar',
    });
  }

  const existingAdm = cleanTexts(risk.existingAdministrativeMeasures);
  if (existingAdm.length) {
    suggestions.push({
      field: 'existingAdministrativeMeasures',
      suggestedValues: existingAdm,
      applyMode: 'append',
      rationale,
      intent: 'verificar',
    });
  }

  const recEng = cleanTexts(risk.recommendedEngineeringMeasures);
  if (recEng.length) {
    suggestions.push({
      field: 'recommendedEngineeringMeasures',
      suggestedValues: recEng,
      applyMode: 'append',
      rationale,
      intent: 'implementar',
    });
  }

  const recAdm = cleanTexts(risk.recommendedAdministrativeMeasures);
  if (recAdm.length) {
    suggestions.push({
      field: 'recommendedAdministrativeMeasures',
      suggestedValues: recAdm,
      applyMode: 'append',
      rationale,
      intent: 'implementar',
    });
  }

  if (
    typeof risk.probability === 'number' &&
    Number.isFinite(risk.probability) &&
    risk.probability >= 1 &&
    risk.probability <= 5
  ) {
    suggestions.push({
      field: 'probability',
      suggestedValues: risk.probability,
      applyMode: 'replace-scalar',
      rationale,
    });
  }

  return {
    riskId: risk.id,
    riskFactorDataId,
    name: risk.name,
    type: risk.type,
    suggestions,
    confidence: risk.confidence,
  };
}
