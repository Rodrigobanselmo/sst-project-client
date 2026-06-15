import type {
  HoMethodAiReviewResult,
  HoMethodImportAgentSuggestion,
  HoMethodImportParseResult,
} from '@v2/services/occupational-hygiene/ho-method/service/ho-method.types';

import { parseOptionalNumber } from './ho-method-import.util';

const toImportField = <T>(value: T | null | undefined, confidence: 'high' | 'medium' | 'low' = 'medium') => ({
  value: value ?? null,
  confidence,
});

const mapAiAgentToSuggestion = (
  agent: HoMethodAiReviewResult['agents'][number],
): HoMethodImportAgentSuggestion => ({
  substanceName: agent.translatedNamePtBr?.trim() || agent.name,
  cas: agent.cas ?? null,
  synonyms: agent.synonyms ?? [],
  technicalNotes: agent.technicalNotes ?? [],
  occupationalLimits: agent.occupationalLimits
    ? {
        acgihTwa: toImportField(agent.occupationalLimits.acgihTwa),
        acgihStel: toImportField(agent.occupationalLimits.acgihStel),
        acgihCeiling: toImportField(agent.occupationalLimits.acgihCeiling),
        aihaWeel: toImportField(agent.occupationalLimits.aihaWeel),
        aihaWeelCeiling: toImportField(agent.occupationalLimits.aihaWeelCeiling),
        oshaPel: toImportField(agent.occupationalLimits.oshaPel),
        oshaStel: toImportField(agent.occupationalLimits.oshaStel),
        oshaCeiling: toImportField(agent.occupationalLimits.oshaCeiling),
        nioshRel: toImportField(agent.occupationalLimits.nioshRel),
        nioshStel: toImportField(agent.occupationalLimits.nioshStel),
        nioshCeiling: toImportField(agent.occupationalLimits.nioshCeiling),
        nioshIdlh: toImportField(null),
      }
    : undefined,
  matchedRiskFactor: agent.matchedRiskFactor ?? null,
  found: Boolean(agent.matchedRiskFactor && agent.matchConfidence === 'high'),
  matchConfidence: agent.matchConfidence ?? 'none',
  candidateRiskFactors: agent.candidateRiskFactors ?? [],
});

export function applyHoMethodAiReviewSelection(params: {
  parserResult: HoMethodImportParseResult;
  aiResult: HoMethodAiReviewResult;
  selectedKeys: string[];
}): HoMethodImportParseResult {
  const { parserResult, aiResult, selectedKeys } = params;
  const selected = new Set(selectedKeys);
  const next: HoMethodImportParseResult = {
    ...parserResult,
    fields: { ...parserResult.fields },
    warnings: [...parserResult.warnings],
  };

  const applyStringField = (
    key: string,
    apply: (value: string) => void,
    value?: string | null,
  ) => {
    if (!selected.has(key) || !value?.trim()) return;
    apply(value.trim());
  };

  applyStringField('method.institution', (value) => {
    next.fields.institution = toImportField(value, 'medium');
  }, aiResult.method?.institution);
  applyStringField('method.methodCode', (value) => {
    next.fields.methodCode = toImportField(value, 'medium');
  }, aiResult.method?.methodCode);
  applyStringField('method.displayName', (value) => {
    next.fields.displayName = toImportField(value, 'medium');
  }, aiResult.method?.displayName);
  applyStringField('method.analyticalMethod', (value) => {
    next.fields.analyticalMethod = toImportField(value, 'medium');
  }, aiResult.method?.analyticalMethod);
  applyStringField('method.evaluation', (value) => {
    next.fields.evaluation = toImportField(value, 'medium');
  }, aiResult.method?.evaluation);

  applyStringField('sampling.sampler', (value) => {
    next.fields.sampler = toImportField(value, 'medium');
  }, aiResult.sampling?.samplerPtBr || aiResult.sampling?.samplerOriginal);
  applyStringField('sampling.flowMin', (value) => {
    next.fields.minimumFlowRate = toImportField(parseOptionalNumber(value), 'medium');
  }, aiResult.sampling?.flowMin ?? undefined);
  applyStringField('sampling.flowMax', (value) => {
    next.fields.maximumFlowRate = toImportField(parseOptionalNumber(value), 'medium');
  }, aiResult.sampling?.flowMax ?? undefined);
  applyStringField('sampling.volumeMin', (value) => {
    next.fields.minimumVolume = toImportField(parseOptionalNumber(value), 'medium');
  }, aiResult.sampling?.volumeMin ?? undefined);
  applyStringField('sampling.volumeMax', (value) => {
    next.fields.maximumVolume = toImportField(parseOptionalNumber(value), 'medium');
  }, aiResult.sampling?.volumeMax ?? undefined);
  applyStringField('sampling.shipment', (value) => {
    next.fields.shipment = toImportField(value, 'medium');
  }, aiResult.sampling?.shipment);
  if (aiResult.sampling?.flowUnit?.trim()) {
    next.fields.flowRateUnit = toImportField(aiResult.sampling.flowUnit.trim(), 'medium');
  }
  if (aiResult.sampling?.volumeUnit?.trim()) {
    next.fields.volumeUnit = toImportField(aiResult.sampling.volumeUnit.trim(), 'medium');
  }

  applyStringField('preparation.stabilityDays', (value) => {
    next.fields.stabilityDays = toImportField(parseOptionalNumber(value), 'medium');
  }, aiResult.preparation?.stabilityDays ?? undefined);
  applyStringField('preparation.stabilityText', (value) => {
    next.fields.stabilityText = toImportField(value, 'medium');
  }, aiResult.preparation?.stabilityText);
  applyStringField('preparation.storageTemperature', (value) => {
    next.fields.storageTemperature = toImportField(parseOptionalNumber(value), 'medium');
  }, aiResult.preparation?.storageTemperature ?? undefined);
  applyStringField('preparation.extractionSolvent', (value) => {
    next.fields.extractionSolvent = toImportField(value, 'medium');
  }, aiResult.preparation?.extractionSolventPtBr || aiResult.preparation?.extractionSolventOriginal);
  if (aiResult.preparation?.storageTemperatureUnit?.trim()) {
    next.fields.storageTemperatureUnit = toImportField(
      aiResult.preparation.storageTemperatureUnit.trim(),
      'medium',
    );
  }

  if (selected.has('agents.list') && aiResult.agents.length) {
    next.agents = aiResult.agents.map(mapAiAgentToSuggestion);
    next.warnings.push('Lista de agentes atualizada com base na análise assistida por IA.');
  }

  const unmatchedAgents = next.agents.filter((agent) => !agent.found);
  next.canConfirm =
    next.isSupportedMethod &&
    Boolean(next.fields.methodCode.value) &&
    next.agents.length > 0 &&
    unmatchedAgents.length === 0;
  next.confirmBlockReason = !next.isSupportedMethod
    ? 'O PDF não parece ser um método NIOSH/NMAM suportado.'
    : !next.fields.methodCode.value
      ? 'Informe ou confirme o código do método antes de importar.'
      : next.agents.length === 0
        ? 'Nenhum agente identificado para importação.'
        : unmatchedAgents.length > 0
          ? 'Vincule todos os agentes a fatores de risco químicos cadastrados antes de confirmar.'
          : null;

  return next;
}
