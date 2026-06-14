import {
  HoMethodAgentTypeEnum,
  HoMethodAvailabilityStatusEnum,
  HoMethodEvaluationTypeEnum,
  HoMethodLaboratoryAvailabilityStatusEnum,
  HoMethodSourceEnum,
} from '@v2/services/occupational-hygiene/ho-method/service/ho-method.types';

export const HO_METHOD_SOURCE_LABELS: Record<HoMethodSourceEnum, string> = {
  [HoMethodSourceEnum.NIOSH]: 'NIOSH',
  [HoMethodSourceEnum.OSHA]: 'OSHA',
  [HoMethodSourceEnum.FUNDACENTRO]: 'Fundacentro',
  [HoMethodSourceEnum.ACGIH]: 'ACGIH',
  [HoMethodSourceEnum.AIHA]: 'AIHA',
  [HoMethodSourceEnum.ISO]: 'ISO',
  [HoMethodSourceEnum.INTERNAL]: 'Método interno',
  [HoMethodSourceEnum.OTHER]: 'Outro',
};

export const HO_METHOD_AGENT_TYPE_LABELS: Record<HoMethodAgentTypeEnum, string> =
  {
    [HoMethodAgentTypeEnum.CHEMICAL]: 'Químico',
    [HoMethodAgentTypeEnum.PHYSICAL]: 'Físico',
    [HoMethodAgentTypeEnum.OTHER]: 'Outro',
  };

export const HO_METHOD_EVALUATION_TYPE_LABELS: Record<
  HoMethodEvaluationTypeEnum,
  string
> = {
  [HoMethodEvaluationTypeEnum.TWA]: 'TWA (ACGIH)',
  [HoMethodEvaluationTypeEnum.STEL]: 'STEL (ACGIH)',
  [HoMethodEvaluationTypeEnum.CEILING]: 'Teto / Ceiling',
  [HoMethodEvaluationTypeEnum.CMPT]: 'CMPT / Jornada (NR-15)',
  [HoMethodEvaluationTypeEnum.VMP]: 'VMP (NR-15)',
  [HoMethodEvaluationTypeEnum.NR15_TETO]: 'TETO (NR-15)',
  [HoMethodEvaluationTypeEnum.ACGIH_CEILING]: 'CEILING (ACGIH)',
  [HoMethodEvaluationTypeEnum.QUALITATIVE]: 'Qualitativo',
  [HoMethodEvaluationTypeEnum.OTHER]: 'Outro',
};

export const HO_METHOD_STATUS_LABELS: Record<
  HoMethodAvailabilityStatusEnum,
  string
> = {
  [HoMethodAvailabilityStatusEnum.ACTIVE]: 'Ativo',
  [HoMethodAvailabilityStatusEnum.INACTIVE]: 'Inativo',
  [HoMethodAvailabilityStatusEnum.UNDER_CONSULTATION]: 'Em consulta',
  [HoMethodAvailabilityStatusEnum.NOT_AVAILABLE]: 'Indisponível',
};

export const HO_METHOD_LAB_STATUS_LABELS: Record<
  HoMethodLaboratoryAvailabilityStatusEnum,
  string
> = {
  [HoMethodLaboratoryAvailabilityStatusEnum.AVAILABLE]: 'Disponível',
  [HoMethodLaboratoryAvailabilityStatusEnum.NOT_AVAILABLE]: 'Indisponível',
  [HoMethodLaboratoryAvailabilityStatusEnum.UNDER_CONSULTATION]: 'Em consulta',
  [HoMethodLaboratoryAvailabilityStatusEnum.UNKNOWN]: 'Desconhecido',
};

export const HO_METHOD_SOURCE_OPTIONS = Object.values(HoMethodSourceEnum).map(
  (value) => ({
    value,
    label: HO_METHOD_SOURCE_LABELS[value],
  }),
);

export const HO_METHOD_AGENT_TYPE_OPTIONS = Object.values(
  HoMethodAgentTypeEnum,
).map((value) => ({
  value,
  label: HO_METHOD_AGENT_TYPE_LABELS[value],
}));

export const HO_METHOD_EVALUATION_TYPE_OPTIONS = Object.values(
  HoMethodEvaluationTypeEnum,
).map((value) => ({
  value,
  label: HO_METHOD_EVALUATION_TYPE_LABELS[value],
}));

export const HO_METHOD_STATUS_OPTIONS = Object.values(
  HoMethodAvailabilityStatusEnum,
).map((value) => ({
  value,
  label: HO_METHOD_STATUS_LABELS[value],
}));

export const HO_METHOD_LAB_STATUS_OPTIONS = Object.values(
  HoMethodLaboratoryAvailabilityStatusEnum,
).map((value) => ({
  value,
  label: HO_METHOD_LAB_STATUS_LABELS[value],
}));

export function formatFlowRange(
  min: number | null,
  max: number | null,
  unit: string | null,
) {
  if (min == null && max == null) return '—';
  const unitSuffix = unit ? ` ${unit}` : '';
  if (min != null && max != null) return `${min} – ${max}${unitSuffix}`;
  if (min != null) return `≥ ${min}${unitSuffix}`;
  return `≤ ${max}${unitSuffix}`;
}

export function formatVolumeRange(
  min: number | null,
  max: number | null,
  unit: string | null,
) {
  return formatFlowRange(min, max, unit);
}

export const HO_METHOD_TEMPERATURE_UNIT_OPTIONS = [
  { value: '°C', label: '°C (Celsius)' },
  { value: '°F', label: '°F (Fahrenheit)' },
] as const;

export function normalizeHoMethodTemperatureUnit(value?: string | null) {
  const normalized = value?.trim();
  if (normalized === '°F' || normalized?.toUpperCase() === 'F') {
    return '°F';
  }
  return '°C';
}

export function formatHoMethodLaboratoryDisplayName(
  lab: import('@v2/services/occupational-hygiene/ho-method/service/ho-method.types').HoMethodLaboratoryRecord,
) {
  if (lab.laboratoryId) {
    return (
      lab.laboratoryTradeName?.trim() ||
      lab.laboratoryCorporateName?.trim() ||
      lab.laboratoryName?.trim() ||
      'Laboratório'
    );
  }

  return lab.laboratoryName?.trim() || 'Laboratório';
}

export function isHoMethodLegacyLaboratory(
  lab: import('@v2/services/occupational-hygiene/ho-method/service/ho-method.types').HoMethodLaboratoryRecord,
) {
  return !lab.laboratoryId && Boolean(lab.laboratoryName?.trim());
}

export function formatHoMethodLaboratorySummary(
  lab: import('@v2/services/occupational-hygiene/ho-method/service/ho-method.types').HoMethodLaboratoryRecord,
) {
  const name = formatHoMethodLaboratoryDisplayName(lab);

  if (isHoMethodLegacyLaboratory(lab)) {
    return `${name} (legado)`;
  }

  const status = HO_METHOD_LAB_STATUS_LABELS[lab.availabilityStatus];
  const hasOverride = [
    lab.samplerId,
    lab.extractionSolventId,
    lab.minimumFlowRateOverride,
    lab.maximumFlowRateOverride,
    lab.minimumVolumeOverride,
    lab.maximumVolumeOverride,
    lab.storageTemperatureOverride,
    lab.stabilityDaysOverride,
    lab.analyticalNotes,
  ].some((value) => value != null && value !== '');

  return `${formatHoMethodLaboratoryDisplayName(lab)} (${status}${hasOverride ? ', com parâmetros próprios' : ''})`;
}

export function buildDefaultDisplayName(
  institution: HoMethodSourceEnum,
  methodCode: string,
) {
  return `${HO_METHOD_SOURCE_LABELS[institution]} ${methodCode}`.trim();
}
