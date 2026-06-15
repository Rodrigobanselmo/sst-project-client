import type { initialAddRiskState } from 'components/organisms/modals/ModalAddRisk/hooks/useAddRisk';

import type {
  RiskFactorAiSuggestionKnownDataPayload,
  RiskFactorAiSuggestionLimitsPayload,
  RiskFactorAiSuggestionPayload,
  RiskFactorAiSuggestionSourceContextPayload,
} from '@v2/services/security/risk/risk-factor-ai-suggestions/service/risk-factor-ai-suggestions.types';

export type RiskFactorAiSuggestionFormSource = Partial<
  typeof initialAddRiskState
> & {
  type?: string;
};

export type BuildRiskFactorAiSuggestionPayloadParams = {
  form: RiskFactorAiSuggestionFormSource;
  sourceContext?: RiskFactorAiSuggestionSourceContextPayload;
  knownDataExtras?: Partial<RiskFactorAiSuggestionKnownDataPayload>;
  customPrompt?: string;
  model?: string;
};

const toSynonymsString = (synonymous?: string[] | string) => {
  if (Array.isArray(synonymous)) {
    return synonymous.filter(Boolean).join('; ') || undefined;
  }

  return synonymous?.trim() || undefined;
};

const pickString = (value?: string | null) => {
  const trimmed = value?.trim();
  return trimmed || undefined;
};

const pickLimits = (
  form: RiskFactorAiSuggestionFormSource,
): RiskFactorAiSuggestionLimitsPayload | undefined => {
  const limits: RiskFactorAiSuggestionLimitsPayload = {
    nr15lt: pickString(form.nr15lt),
    acgihTwa: pickString(form.twa),
    acgihStel: pickString(form.stel),
    acgihCeiling: pickString(form.acgihCeiling),
    nioshRel: pickString(form.nioshRel),
    nioshStel: pickString(form.nioshStel),
    nioshCeiling: pickString(form.nioshCeiling),
    nioshIdlh: pickString(form.ipvs),
    oshaPel: pickString(form.oshaPel),
    oshaStel: pickString(form.oshaStel),
    oshaCeiling: pickString(form.oshaCeiling),
    aihaWeel: pickString(form.aihaWeel),
    aihaWeelCeiling: pickString(form.aihaWeelCeiling),
  };

  const entries = Object.entries(limits).filter(([, value]) => Boolean(value));
  if (!entries.length) return undefined;

  return Object.fromEntries(entries) as RiskFactorAiSuggestionLimitsPayload;
};

const pickKnownData = (
  form: RiskFactorAiSuggestionFormSource,
  knownDataExtras?: Partial<RiskFactorAiSuggestionKnownDataPayload>,
): RiskFactorAiSuggestionKnownDataPayload | undefined => {
  const knownData: RiskFactorAiSuggestionKnownDataPayload = {
    risk: pickString(form.risk),
    symptoms: pickString(form.symptoms),
    severity: form.severity && Number(form.severity) > 0 ? Number(form.severity) : undefined,
    carcinogenicityAcgih: pickString(form.carnogenicityACGIH),
    carcinogenicityLinach: pickString(form.carnogenicityLinach),
    pv: pickString(form.pv),
    pe: pickString(form.pe),
    observations: pickString(form.coments),
    ...knownDataExtras,
  };

  const entries = Object.entries(knownData).filter(([, value]) => {
    if (value == null) return false;
    if (typeof value === 'string') return Boolean(value.trim());
    return true;
  });

  if (!entries.length) return undefined;

  return Object.fromEntries(entries) as RiskFactorAiSuggestionKnownDataPayload;
};

export function buildRiskFactorAiSuggestionPayload(
  params: BuildRiskFactorAiSuggestionPayloadParams,
): RiskFactorAiSuggestionPayload {
  const { form, sourceContext, knownDataExtras, customPrompt, model } = params;

  return {
    type: form.type || 'QUI',
    name: pickString(form.name),
    cas: pickString(form.cas),
    synonyms: toSynonymsString(form.synonymous),
    unit: pickString(form.unit),
    method: pickString(form.method),
    limits: pickLimits(form),
    knownData: pickKnownData(form, knownDataExtras),
    sourceContext,
    customPrompt: pickString(customPrompt),
    model: pickString(model),
  };
}

export function hasRiskFactorAiSuggestionFieldContent(
  form: RiskFactorAiSuggestionFormSource,
): boolean {
  const hasRisk = Boolean(form.risk?.trim());
  const hasSymptoms = Boolean(form.symptoms?.trim());
  const hasSeverity = Boolean(form.severity && Number(form.severity) > 0);

  return hasRisk || hasSymptoms || hasSeverity;
}

export function mergeRiskFactorAiSuggestionText(
  current: string | undefined,
  suggestion: string,
): string {
  const existing = current?.trim();
  const incoming = suggestion.trim();

  if (!existing) return incoming;
  if (!incoming) return existing;

  return `${existing}\n\n${incoming}`;
}
