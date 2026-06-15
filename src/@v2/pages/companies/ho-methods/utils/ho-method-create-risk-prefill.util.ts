import { initialAddRiskState } from 'components/organisms/modals/ModalAddRisk/hooks/useAddRisk';
import { RiskEnum } from 'project/enum/risk.enums';
import { StatusEnum } from 'project/enum/status.enum';

import type {
  HoMethodImportField,
  HoMethodImportOccupationalLimitSuggestions,
} from '@v2/services/occupational-hygiene/ho-method/service/ho-method.types';

export type HoMethodCreateRiskAgentSource = {
  substanceName: string;
  cas: string | null;
  synonyms: string[];
};

/** Etapa B: sugestões assistidas para risco, sintomas e severidade. */
export type HoMethodCreateRiskSmartSuggestions = {
  riskDescription?: string;
  symptoms?: string;
  severity?: number;
  source?: 'rules' | 'ai';
};

export type HoMethodCreateRiskMethodContext = {
  displayName: string;
  institution?: string;
  methodCode?: string;
};

export type HoMethodCreateRiskParseContext = {
  fields?: import('@v2/services/occupational-hygiene/ho-method/service/ho-method.types').HoMethodImportParseResult['fields'];
  warnings?: string[];
};

export type HoMethodCreateRiskPrefillInput = {
  companyId: string;
  agent: HoMethodCreateRiskAgentSource;
  method: HoMethodCreateRiskMethodContext;
  occupationalLimits?: HoMethodImportOccupationalLimitSuggestions | null;
  parseContext?: HoMethodCreateRiskParseContext | null;
  smartSuggestions?: HoMethodCreateRiskSmartSuggestions;
};

export type ParsedOccupationalLimitExpression = {
  value: string | null;
  unit: string | null;
  notes: string | null;
  raw: string;
};

const LIMIT_LABEL_PREFIX =
  /^(?:PEL|REL|TWA|STEL|Ceiling|CEILING|Ceil\.?|WEEL|WEEL-C|IDLH|IPVS)\s*:?\s*/i;

const TRAILING_NOTE_PATTERN = /\(([^)]+)\)\s*$/;

const VALUE_UNIT_PATTERN =
  /^([\d]+(?:[.,]\d+)?(?:\s*-\s*[\d]+(?:[.,]\d+)?)?)\s*([a-zA-Zμµ°/%][a-zA-Z0-9μµ°/²³\-]*)\s*$/;

const VALUE_ONLY_PATTERN = /^([\d]+(?:[.,]\d+)?(?:\s*-\s*[\d]+(?:[.,]\d+)?)?)$/;

export const normalizeDecimalForPtBr = (value: string): string =>
  value
    .trim()
    .replace(/\s*-\s*/g, '-')
    .replace(/(\d)\.(\d)/g, '$1,$2');

export const normalizeOccupationalLimitUnit = (unit: string): string =>
  unit
    .trim()
    .replace(/³/g, '3')
    .replace(/²/g, '2')
    .replace(/µ/g, 'μ')
    .replace(/\s+/g, '')
    .replace(/\/m3$/i, '/m3')
    .replace(/\/m2$/i, '/m2');

export const parseOccupationalLimitExpression = (
  raw?: string | null,
): ParsedOccupationalLimitExpression => {
  const trimmed = raw?.trim() ?? '';

  if (!trimmed) {
    return { value: null, unit: null, notes: null, raw: trimmed };
  }

  let working = trimmed.replace(LIMIT_LABEL_PREFIX, '').trim();
  let notes: string | null = null;

  const noteMatch = working.match(TRAILING_NOTE_PATTERN);
  if (noteMatch) {
    notes = noteMatch[1].trim();
    working = working.slice(0, noteMatch.index).trim();
  }

  const valueUnitMatch = working.match(VALUE_UNIT_PATTERN);
  if (valueUnitMatch) {
    return {
      value: normalizeDecimalForPtBr(valueUnitMatch[1]),
      unit: normalizeOccupationalLimitUnit(valueUnitMatch[2]),
      notes,
      raw: trimmed,
    };
  }

  const valueOnlyMatch = working.match(VALUE_ONLY_PATTERN);
  if (valueOnlyMatch) {
    return {
      value: normalizeDecimalForPtBr(valueOnlyMatch[1]),
      unit: null,
      notes,
      raw: trimmed,
    };
  }

  const looseNumberMatch = working.match(/^([\d]+(?:[.,]\d+)?(?:\s*-\s*[\d]+(?:[.,]\d+)?)?)/);
  if (looseNumberMatch) {
    const remainder = working.slice(looseNumberMatch[0].length).trim();
    const mergedNotes = [notes, remainder].filter(Boolean).join('; ') || null;

    return {
      value: normalizeDecimalForPtBr(looseNumberMatch[1]),
      unit: null,
      notes: mergedNotes,
      raw: trimmed,
    };
  }

  return {
    value: null,
    unit: null,
    notes: [notes, working].filter(Boolean).join('; ') || trimmed,
    raw: trimmed,
  };
};

const pickParsedLimit = (
  field?: HoMethodImportField<string>,
): ParsedOccupationalLimitExpression | null => {
  if (!field?.value?.trim()) return null;
  if (field.confidence === 'low') return null;
  return parseOccupationalLimitExpression(field.value);
};

const buildLimitComments = (
  entries: Array<{ label: string; parsed: ParsedOccupationalLimitExpression }>,
  methodDisplayName?: string,
) => {
  const noteLines = entries
    .map(({ label, parsed }) => {
      if (!parsed.notes) return null;
      return `${label}: ${parsed.notes}`;
    })
    .filter(Boolean);

  if (!noteLines.length) return undefined;

  const header = methodDisplayName
    ? `Observações importadas do método ${methodDisplayName}:`
    : 'Observações importadas do método analítico:';

  return [header, ...noteLines].join('\n');
};

const resolveSharedUnit = (
  parsedLimits: ParsedOccupationalLimitExpression[],
): string | undefined => {
  const units = parsedLimits
    .map((item) => item.unit)
    .filter((unit): unit is string => Boolean(unit));

  if (!units.length) return undefined;

  const uniqueUnits = [...new Set(units)];
  return uniqueUnits.length === 1 ? uniqueUnits[0] : units[0];
};

const pickImportFieldForComments = <T>(
  field?: HoMethodImportField<T>,
): string | null => {
  if (!field?.value) return null;
  if (typeof field.value === 'string') {
    return field.value.trim() ? field.value.trim() : null;
  }
  return field.value != null ? String(field.value) : null;
};

const buildMethodTechnicalComments = (
  params: Pick<
    HoMethodCreateRiskPrefillInput,
    'method' | 'parseContext'
  >,
  existingComments?: string,
): string | undefined => {
  const fields = params.parseContext?.fields;
  const lines = [
    existingComments,
    pickImportFieldForComments(fields?.observations)
      ? `Observações do método: ${pickImportFieldForComments(fields?.observations)}`
      : null,
    pickImportFieldForComments(fields?.applicability)
      ? `Aplicabilidade: ${pickImportFieldForComments(fields?.applicability)}`
      : null,
    pickImportFieldForComments(fields?.analyte)
      ? `Analito: ${pickImportFieldForComments(fields?.analyte)}`
      : null,
    pickImportFieldForComments(fields?.analyticalMethod)
      ? `Técnica analítica: ${pickImportFieldForComments(fields?.analyticalMethod)}`
      : null,
    pickImportFieldForComments(fields?.evaluation)
      ? `Avaliação: ${pickImportFieldForComments(fields?.evaluation)}`
      : null,
    params.method.displayName
      ? `Referência: método ${params.method.displayName}.`
      : null,
  ].filter((line): line is string => Boolean(line?.trim()));

  if (!lines.length) return undefined;

  return [...new Set(lines)].join('\n');
};

export const buildHoMethodCreateRiskPrefill = (
  params: HoMethodCreateRiskPrefillInput,
): Partial<typeof initialAddRiskState> => {
  const limits = params.occupationalLimits;

  const limitMappings = [
    { key: 'twa' as const, label: 'ACGIH TWA', parsed: pickParsedLimit(limits?.acgihTwa) },
    { key: 'stel' as const, label: 'ACGIH STEL', parsed: pickParsedLimit(limits?.acgihStel) },
    {
      key: 'acgihCeiling' as const,
      label: 'ACGIH Ceiling',
      parsed: pickParsedLimit(limits?.acgihCeiling),
    },
    { key: 'oshaPel' as const, label: 'OSHA PEL', parsed: pickParsedLimit(limits?.oshaPel) },
    { key: 'oshaStel' as const, label: 'OSHA STEL', parsed: pickParsedLimit(limits?.oshaStel) },
    {
      key: 'oshaCeiling' as const,
      label: 'OSHA Ceiling',
      parsed: pickParsedLimit(limits?.oshaCeiling),
    },
    { key: 'nioshRel' as const, label: 'NIOSH REL', parsed: pickParsedLimit(limits?.nioshRel) },
    { key: 'nioshStel' as const, label: 'NIOSH STEL', parsed: pickParsedLimit(limits?.nioshStel) },
    {
      key: 'nioshCeiling' as const,
      label: 'NIOSH Ceiling',
      parsed: pickParsedLimit(limits?.nioshCeiling),
    },
    { key: 'ipvs' as const, label: 'NIOSH IDLH', parsed: pickParsedLimit(limits?.nioshIdlh) },
    { key: 'aihaWeel' as const, label: 'AIHA WEEL', parsed: pickParsedLimit(limits?.aihaWeel) },
    {
      key: 'aihaWeelCeiling' as const,
      label: 'AIHA WEEL-C',
      parsed: pickParsedLimit(limits?.aihaWeelCeiling),
    },
  ];

  const parsedEntries = limitMappings.filter(
    (item): item is typeof item & { parsed: ParsedOccupationalLimitExpression } =>
      Boolean(item.parsed?.value),
  );

  const limitValues = Object.fromEntries(
    parsedEntries.map(({ key, parsed }) => [key, parsed.value ?? undefined]),
  ) as Partial<typeof initialAddRiskState>;

  const sharedUnit = resolveSharedUnit(parsedEntries.map((item) => item.parsed));
  const limitComments = buildLimitComments(
    parsedEntries.map(({ label, parsed }) => ({ label, parsed })),
    params.method.displayName,
  );
  const coments = buildMethodTechnicalComments(params, limitComments);

  return {
    ...initialAddRiskState,
    id: '',
    companyId: params.companyId,
    status: StatusEnum.ACTIVE,
    type: RiskEnum.QUI,
    name: params.agent.substanceName.trim(),
    cas: params.agent.cas?.trim() || undefined,
    synonymous: params.agent.synonyms.filter(Boolean),
    method: params.method.displayName.trim() || undefined,
    unit: sharedUnit,
    coments,
    ...limitValues,
  };
};
