import { parseExamRiskPurposeDraft } from 'core/utils/helpers/examRiskPurpose';
import type { IPcmsoComparableConfig } from '@v2/services/medicine/company-exam-risk-coverage/company-exam-risk-coverage.types';
import {
  inlineParameterFields,
  type InlineParameterGroup,
  type InlineParameterDraft,
} from './exam-risk-inline-parameter.util';

// Library semantics allow unspecified/null thresholds and periodicity; do not use the company validator.
export function buildLibraryParameterPatch(
  group: InlineParameterGroup,
  draft: InlineParameterDraft,
  config: IPcmsoComparableConfig,
) {
  if (group === 'purpose') return parseExamRiskPurposeDraft(draft);
  const patch: Record<string, number | boolean | null> = {};
  for (const field of inlineParameterFields[group]) {
    if (field.startsWith('is')) {
      if (typeof draft[field] !== 'boolean')
        throw new Error('Confira as opções selecionadas.');
      patch[field] = draft[field] as boolean;
    } else {
      const value = draft[field];
      if (typeof value !== 'string')
        throw new Error('Confira o valor informado.');
      const text = value.trim();
      if (text && (!/^\d+$/.test(text) || !Number.isSafeInteger(Number(text))))
        throw new Error('Informe um número inteiro não negativo.');
      const number = text === '' ? null : Number(text);
      if (
        (group === 'minRiskDegree' || group === 'minRiskDegreeQuantity') &&
        number != null &&
        number > 5
      )
        throw new Error('Nível da matriz inválido.');
      patch[field] = number;
    }
  }
  if (
    group === 'events' &&
    draft.isPeriodic === true &&
    draft.validityInMonths !==
      (config.validityInMonths == null ? '' : String(config.validityInMonths))
  ) {
    Object.assign(
      patch,
      buildLibraryParameterPatch('validityInMonths', draft, config),
    );
  }
  const merged = { ...config, ...patch };
  if (
    merged.fromAge != null &&
    merged.toAge != null &&
    Number(merged.fromAge) > Number(merged.toAge)
  )
    throw new Error('A idade inicial não pode superar a final.');
  return patch;
}

export const biologicalPeriodicityWarning =
  'O padrão do sistema para esta indicação é de 6 meses.';
export const confirmBiologicalPeriodicityDeviation = () =>
  window.confirm(`${biologicalPeriodicityWarning} Deseja salvar a periodicidade divergente?`);

export function hasSemiannualStandard(config?: Partial<IPcmsoComparableConfig> | null) {
  return config?.recommendationPurpose === 'BIOLOGICAL_MONITORING' ||
    config?.periodicityReferences?.some(ref =>
      ref.state === 'CONFIRMED' && ref.periodicityMonths === 6,
    ) === true;
}

export function hasBiologicalPeriodicityDeviation(config?: Partial<IPcmsoComparableConfig> | null) {
  return hasSemiannualStandard(config) && config?.isPeriodic === true && config.validityInMonths !== 6;
}

export function changesBiologicalPeriodicity(
  config: IPcmsoComparableConfig,
  patch: Partial<IPcmsoComparableConfig>,
) {
  const next = { ...config, ...patch };
  return hasBiologicalPeriodicityDeviation(next) &&
    (next.validityInMonths !== config.validityInMonths ||
      next.isPeriodic !== config.isPeriodic ||
      next.recommendationPurpose !== config.recommendationPurpose);
}
