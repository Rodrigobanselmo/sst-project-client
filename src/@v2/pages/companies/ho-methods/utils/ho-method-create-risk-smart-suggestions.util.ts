import { SeverityEnum } from 'project/enum/severity.enums';

import type {
  HoMethodImportField,
  HoMethodImportOccupationalLimitSuggestions,
} from '@v2/services/occupational-hygiene/ho-method/service/ho-method.types';

import type {
  HoMethodCreateRiskAgentSource,
  HoMethodCreateRiskMethodContext,
  HoMethodCreateRiskParseContext,
  HoMethodCreateRiskSmartSuggestions,
} from './ho-method-create-risk-prefill.util';

export type HoMethodCreateRiskSuggestionSource = 'rules' | 'ai';

export type HoMethodCreateRiskSmartSuggestionInput = {
  agent: HoMethodCreateRiskAgentSource;
  method: HoMethodCreateRiskMethodContext;
  parseContext?: HoMethodCreateRiskParseContext | null;
  occupationalLimits?: HoMethodImportOccupationalLimitSuggestions | null;
};

const pickImportField = <T>(
  field?: HoMethodImportField<T>,
): T | null => {
  if (field == null || field.confidence === 'low') return null;
  if (typeof field.value === 'string') {
    return field.value.trim() ? (field.value.trim() as T) : null;
  }
  return field.value ?? null;
};

const joinParagraphs = (parts: Array<string | null | undefined>) =>
  parts.filter((part) => Boolean(part?.trim())).join('\n\n');

const inferSeverityFromLimits = (
  limits?: HoMethodImportOccupationalLimitSuggestions | null,
): number | undefined => {
  const idlh = pickImportField(limits?.nioshIdlh);
  if (idlh) return SeverityEnum.MEDIUM_HIGH;

  const hasAnyLimit = [
    limits?.acgihTwa,
    limits?.acgihStel,
    limits?.acgihCeiling,
    limits?.oshaPel,
    limits?.oshaStel,
    limits?.oshaCeiling,
    limits?.nioshRel,
    limits?.nioshStel,
    limits?.nioshCeiling,
    limits?.aihaWeel,
    limits?.aihaWeelCeiling,
  ].some((field) => Boolean(pickImportField(field)));

  if (hasAnyLimit) return SeverityEnum.MEDIUM;

  return undefined;
};

/**
 * Etapa B v1 — sugestões determinísticas a partir do parse do método.
 * Etapa B v2 (futuro) — substituir/ complementar via provider IA (`source: 'ai'`).
 */
export const buildRuleBasedHoMethodCreateRiskSmartSuggestions = (
  params: HoMethodCreateRiskSmartSuggestionInput,
): HoMethodCreateRiskSmartSuggestions => {
  const fields = params.parseContext?.fields;
  const agentLabel = params.agent.substanceName.trim();
  const casLabel = params.agent.cas?.trim();

  const applicability = pickImportField(fields?.applicability);
  const evaluation = pickImportField(fields?.evaluation);
  const analyte = pickImportField(fields?.analyte);
  const technique = pickImportField(fields?.analyticalMethod);
  const observations = pickImportField(fields?.observations);

  const riskDescription = joinParagraphs([
    `Exposição ocupacional ao agente químico ${agentLabel}${casLabel ? ` (CAS ${casLabel})` : ''}.`,
    applicability ? `Aplicabilidade informada no método: ${applicability}` : null,
    evaluation ? `Avaliação do método: ${evaluation}.` : null,
    analyte ? `Analito: ${analyte}.` : null,
    technique ? `Técnica analítica: ${technique}.` : null,
    params.method.displayName
      ? `Referência: método ${params.method.displayName}.`
      : null,
  ]);

  const symptoms = observations ?? undefined;

  const severity = inferSeverityFromLimits(params.occupationalLimits);

  return {
    riskDescription: riskDescription || undefined,
    symptoms,
    severity,
    source: 'rules',
  };
};

export const buildManualHoMethodCreateRiskSmartSuggestions = (
  params: Pick<
    HoMethodCreateRiskSmartSuggestionInput,
    'agent' | 'method'
  >,
): HoMethodCreateRiskSmartSuggestions => {
  const agentLabel = params.agent.substanceName.trim();
  const casLabel = params.agent.cas?.trim();

  return {
    riskDescription: joinParagraphs([
      `Exposição ocupacional ao agente químico ${agentLabel}${casLabel ? ` (CAS ${casLabel})` : ''}.`,
      params.method.displayName
        ? `Agente associado ao método ${params.method.displayName}.`
        : null,
    ]),
    source: 'rules',
  };
};

export const resolveHoMethodCreateRiskSmartSuggestions = (
  params: HoMethodCreateRiskSmartSuggestionInput & {
    smartSuggestions?: HoMethodCreateRiskSmartSuggestions;
  },
): HoMethodCreateRiskSmartSuggestions | undefined => {
  if (params.smartSuggestions) {
    return params.smartSuggestions;
  }

  if (params.parseContext?.fields) {
    return buildRuleBasedHoMethodCreateRiskSmartSuggestions(params);
  }

  if (params.agent.substanceName.trim()) {
    return buildManualHoMethodCreateRiskSmartSuggestions(params);
  }

  return undefined;
};

/**
 * Ponto de extensão Etapa B v2 — provider IA (não implementado).
 * Manter assinatura estável para plugar endpoint/API futuramente.
 */
export type HoMethodCreateRiskAiSuggestionProvider = (
  input: HoMethodCreateRiskSmartSuggestionInput,
) => Promise<HoMethodCreateRiskSmartSuggestions | null>;

export const hoMethodCreateRiskAiSuggestionProvider: HoMethodCreateRiskAiSuggestionProvider =
  async () => null;
