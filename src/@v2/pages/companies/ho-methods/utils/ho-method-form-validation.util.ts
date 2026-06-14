import type {
  HoMethodLaboratoryPayload,
  HoMethodWritePayload,
} from '@v2/services/occupational-hygiene/ho-method/service/ho-method.types';

import { normalizeHoMethodTemperatureUnit } from '../maps/ho-method.maps';
import {
  isValidLocaleDecimalInput,
  parseLocaleDecimal,
} from './ho-method-number.util';

export type HoMethodNumericFieldKey =
  | 'minimumFlowRate'
  | 'maximumFlowRate'
  | 'minimumVolume'
  | 'maximumVolume'
  | 'storageTemperature'
  | 'stabilityDays';

export const HO_METHOD_NUMERIC_FIELD_KEYS: HoMethodNumericFieldKey[] = [
  'minimumFlowRate',
  'maximumFlowRate',
  'minimumVolume',
  'maximumVolume',
  'storageTemperature',
  'stabilityDays',
];

export type HoMethodNumericInputs = Record<HoMethodNumericFieldKey, string>;

export const emptyNumericInputs = (): HoMethodNumericInputs => ({
  minimumFlowRate: '',
  maximumFlowRate: '',
  minimumVolume: '',
  maximumVolume: '',
  storageTemperature: '',
  stabilityDays: '',
});

export function numericInputsFromPayload(
  payload: HoMethodWritePayload,
): HoMethodNumericInputs {
  const format = (value?: number | null) =>
    value == null ? '' : String(value).replace('.', ',');

  return {
    minimumFlowRate: format(payload.minimumFlowRate),
    maximumFlowRate: format(payload.maximumFlowRate),
    minimumVolume: format(payload.minimumVolume),
    maximumVolume: format(payload.maximumVolume),
    storageTemperature: format(payload.storageTemperature),
    stabilityDays:
      payload.stabilityDays == null ? '' : String(payload.stabilityDays),
  };
}

export function parseNumericInputs(
  inputs: HoMethodNumericInputs,
): {
  values: Pick<
    HoMethodWritePayload,
    HoMethodNumericFieldKey
  >;
  errors: Partial<Record<HoMethodNumericFieldKey, string>>;
} {
  const errors: Partial<Record<HoMethodNumericFieldKey, string>> = {};
  const values = {} as Pick<HoMethodWritePayload, HoMethodNumericFieldKey>;

  for (const key of HO_METHOD_NUMERIC_FIELD_KEYS) {
    const raw = inputs[key];

    if (!raw.trim()) {
      values[key] = key === 'stabilityDays' ? null : null;
      continue;
    }

    if (key === 'stabilityDays') {
      const parsed = parseLocaleDecimal(raw);
      if (parsed == null || !Number.isInteger(parsed) || parsed < 0) {
        errors[key] = 'Informe um número inteiro válido.';
        continue;
      }
      values[key] = parsed;
      continue;
    }

    if (!isValidLocaleDecimalInput(raw)) {
      errors[key] =
        'Valor numérico inválido. Use formatos como 0,2 ou 0.2.';
      continue;
    }

    values[key] = parseLocaleDecimal(raw);
  }

  return { values, errors };
}

export function validateHoMethodForm(params: {
  form: HoMethodWritePayload;
  numericInputs: HoMethodNumericInputs;
}): Record<string, string> {
  const errors: Record<string, string> = {};
  const { values, errors: numericErrors } = parseNumericInputs(
    params.numericInputs,
  );

  Object.entries(numericErrors).forEach(([key, message]) => {
    errors[key] = message;
  });

  if (!params.form.institution) {
    errors.institution = 'Instituição / fonte é obrigatória.';
  }

  if (!params.form.methodCode?.trim()) {
    errors.methodCode = 'Código do método é obrigatório.';
  }

  if (!params.form.riskFactorId && !(params.form.agents ?? []).length) {
    errors.riskFactorId =
      'Adicione pelo menos um agente químico cadastrado ao método de HO.';
  }

  const hasConditions =
    (params.form.agents ?? []).some(
      (agent) => (agent.evaluationConditions ?? []).length > 0,
    ) || (params.form.evaluationConditions ?? []).length > 0;

  if (!hasConditions) {
    errors.evaluationConditions =
      'Selecione pelo menos uma condição de avaliação para o agente químico vinculado.';
  }

  const minFlow = values.minimumFlowRate;
  const maxFlow = values.maximumFlowRate;
  if (minFlow != null && maxFlow != null && minFlow > maxFlow) {
    errors.maximumFlowRate =
      'A vazão máxima deve ser maior ou igual à vazão mínima.';
  }

  const minVolume = values.minimumVolume;
  const maxVolume = values.maximumVolume;
  if (minVolume != null && maxVolume != null && minVolume > maxVolume) {
    errors.maximumVolume =
      'O volume máximo deve ser maior ou igual ao volume mínimo.';
  }

  return errors;
}

export function buildHoMethodSubmitPayload(params: {
  form: HoMethodWritePayload;
  numericInputs: HoMethodNumericInputs;
  computedDisplayName: string;
}): HoMethodWritePayload {
  const { values } = parseNumericInputs(params.numericInputs);

  return {
    ...params.form,
    displayName: params.form.displayName?.trim() || params.computedDisplayName,
    methodCode: params.form.methodCode.trim(),
    storageTemperatureUnit: normalizeHoMethodTemperatureUnit(
      params.form.storageTemperatureUnit,
    ),
    minimumFlowRate: values.minimumFlowRate ?? null,
    maximumFlowRate: values.maximumFlowRate ?? null,
    minimumVolume: values.minimumVolume ?? null,
    maximumVolume: values.maximumVolume ?? null,
    storageTemperature: values.storageTemperature ?? null,
    stabilityDays: values.stabilityDays ?? null,
  };
}

export type LabNumericFieldKey =
  | 'minimumFlowRateOverride'
  | 'maximumFlowRateOverride'
  | 'minimumVolumeOverride'
  | 'maximumVolumeOverride'
  | 'storageTemperatureOverride'
  | 'stabilityDaysOverride';

export const LAB_NUMERIC_FIELD_KEYS: LabNumericFieldKey[] = [
  'minimumFlowRateOverride',
  'maximumFlowRateOverride',
  'minimumVolumeOverride',
  'maximumVolumeOverride',
  'storageTemperatureOverride',
  'stabilityDaysOverride',
];

export type LabNumericInputs = Record<string, string>;

export function buildLabNumericInputKey(
  index: number,
  field: LabNumericFieldKey,
) {
  return `${index}:${field}`;
}

export function labNumericInputsFromLaboratories(
  laboratories: HoMethodLaboratoryPayload[],
): LabNumericInputs {
  const inputs: LabNumericInputs = {};
  const format = (value?: number | null) =>
    value == null ? '' : String(value).replace('.', ',');

  laboratories.forEach((lab, index) => {
    for (const field of LAB_NUMERIC_FIELD_KEYS) {
      inputs[buildLabNumericInputKey(index, field)] = format(lab[field]);
    }
  });

  return inputs;
}

export function applyLabNumericInputs(
  laboratories: HoMethodLaboratoryPayload[],
  inputs: LabNumericInputs,
): {
  laboratories: HoMethodLaboratoryPayload[];
  errors: LabNumericInputs;
} {
  const errors: LabNumericInputs = {};

  const next = laboratories.map((lab, index) => {
    const patch: Partial<HoMethodLaboratoryPayload> = {};

    for (const field of LAB_NUMERIC_FIELD_KEYS) {
      const key = buildLabNumericInputKey(index, field);
      const raw = inputs[key] ?? '';

      if (!raw.trim()) {
        patch[field] = null;
        continue;
      }

      if (field === 'stabilityDaysOverride') {
        const parsed = parseLocaleDecimal(raw);
        if (parsed == null || !Number.isInteger(parsed) || parsed < 0) {
          errors[key] = 'Informe um número inteiro válido.';
          continue;
        }
        patch[field] = parsed;
        continue;
      }

      if (!isValidLocaleDecimalInput(raw)) {
        errors[key] = 'Use valores como 0,2 ou 0.2.';
        continue;
      }

      patch[field] = parseLocaleDecimal(raw);
    }

    return { ...lab, ...patch };
  }).map((lab) => ({
    ...lab,
    storageTemperatureUnitOverride: lab.storageTemperatureUnitOverride
      ? normalizeHoMethodTemperatureUnit(lab.storageTemperatureUnitOverride)
      : lab.storageTemperatureUnitOverride,
  }));

  return { laboratories: next, errors };
}
