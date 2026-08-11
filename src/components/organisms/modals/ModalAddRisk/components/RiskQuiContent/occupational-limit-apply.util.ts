import type { ChemicalOccupationalEnrichResult } from '@v2/services/security/characterization/chemical-product/service/chemical-product.types';

export type OccupationalLimitFormSnapshot = {
  cas?: string | null;
  unit?: string | null;
  nioshRel?: string | null;
  nioshStel?: string | null;
  nioshCeiling?: string | null;
  ipvs?: string | null;
  oshaPel?: string | null;
  oshaStel?: string | null;
  oshaCeiling?: string | null;
  breather?: string | null;
  json?: {
    ipvs?: {
      unit?: string;
      reference?: string;
      origin?: string;
    };
  } | null;
};

export type OccupationalLimitFieldKey =
  | 'nioshRel'
  | 'nioshStel'
  | 'nioshCeiling'
  | 'ipvs'
  | 'oshaPel'
  | 'oshaStel'
  | 'oshaCeiling'
  | 'unit';

export type OccupationalApplyAction =
  | 'FILL'
  | 'SKIP_EXISTING'
  | 'SKIP_UNIT_REVIEW'
  | 'SKIP_DIVERGENCE'
  | 'SKIP_EMPTY_SOURCE'
  | 'SKIP_UNPARSEABLE';

export type OccupationalReviewRow = {
  field: OccupationalLimitFieldKey;
  label: string;
  group: 'NIOSH' | 'OSHA' | 'UNIT';
  currentValue: string | null;
  foundRaw: string | null;
  foundFormValue: string | null;
  foundUnit: string | null;
  applyStatus: string | null;
  sourceName: string | null;
  sourceField: string | null;
  sourceUrl: string | null;
  alternateRepresentations: Array<{
    numeric: string;
    unit: string;
    rawFragment: string;
  }>;
  conversion: {
    molecularWeight: number;
    molecularWeightSource: string;
    temperatureC: number;
    pressureAtm: number;
    formula: string;
    originalValue: string;
    originalUnit: string;
    convertedValue: string;
    convertedUnit: string;
    verificationStatus: string;
  } | null;
  action: OccupationalApplyAction;
  divergent: boolean;
};

const FIELD_META: Array<{
  field: OccupationalLimitFieldKey;
  label: string;
  group: 'NIOSH' | 'OSHA' | 'UNIT';
}> = [
  { field: 'nioshRel', label: 'NIOSH REL', group: 'NIOSH' },
  { field: 'nioshStel', label: 'NIOSH STEL', group: 'NIOSH' },
  { field: 'nioshCeiling', label: 'NIOSH Ceiling', group: 'NIOSH' },
  { field: 'ipvs', label: 'IDLH / IPVS', group: 'NIOSH' },
  { field: 'oshaPel', label: 'OSHA PEL', group: 'OSHA' },
  { field: 'oshaStel', label: 'OSHA STEL', group: 'OSHA' },
  { field: 'oshaCeiling', label: 'OSHA Ceiling', group: 'OSHA' },
  { field: 'unit', label: 'Unidade (RiskFactor)', group: 'UNIT' },
];

function isFilled(value: string | null | undefined): boolean {
  return Boolean(String(value || '').trim());
}

function normalizeCompare(value: string | null | undefined): string {
  return String(value || '')
    .trim()
    .replace(/\./g, ',')
    .replace(/\s+/g, '');
}

function traceForField(
  result: ChemicalOccupationalEnrichResult,
  field: OccupationalLimitFieldKey,
) {
  return (result.occupationalData.traces || []).find((t) => t.riskField === field);
}

/**
 * Plano de aplicação seguro:
 * - só FILL se campo atual vazio + applyStatus APPLY_SAFE + formValue presente
 * - nunca sobrescreve existente
 * - UNIT_REVIEW_REQUIRED / divergência → skip
 */
export function buildOccupationalReviewRows(
  result: ChemicalOccupationalEnrichResult,
  current: OccupationalLimitFormSnapshot,
): OccupationalReviewRow[] {
  const prefill = result.prefill;

  return FIELD_META.map((meta) => {
    const trace = traceForField(result, meta.field);
    const currentValue =
      meta.field === 'unit'
        ? current.unit || null
        : (current[meta.field] as string | null | undefined) || null;

    const foundFormValue =
      meta.field === 'unit'
        ? prefill.unit
        : (prefill[meta.field as keyof typeof prefill] as string | null) ||
          trace?.formValue ||
          null;

    const foundRaw = trace?.raw || null;
    const applyStatus = trace?.applyStatus || null;
    const filled = isFilled(currentValue);
    const hasFound = isFilled(foundFormValue);
    const divergent =
      filled &&
      hasFound &&
      normalizeCompare(currentValue) !== normalizeCompare(foundFormValue);

    let action: OccupationalApplyAction = 'SKIP_EMPTY_SOURCE';
    if (!hasFound) {
      action =
        applyStatus === 'UNIT_REVIEW_REQUIRED'
          ? 'SKIP_UNIT_REVIEW'
          : applyStatus === 'UNPARSEABLE'
            ? 'SKIP_UNPARSEABLE'
            : 'SKIP_EMPTY_SOURCE';
    } else if (filled) {
      action = divergent ? 'SKIP_DIVERGENCE' : 'SKIP_EXISTING';
    } else if (
      applyStatus === 'UNIT_REVIEW_REQUIRED' ||
      (meta.field === 'unit' &&
        (result.occupationalData.unitConflict ||
          result.occupationalData.unitReviewRequired))
    ) {
      action = 'SKIP_UNIT_REVIEW';
    } else if (applyStatus && applyStatus !== 'APPLY_SAFE' && meta.field !== 'unit') {
      action = 'SKIP_UNPARSEABLE';
    } else {
      action = 'FILL';
    }

    // Com targetUnit no RF: nunca preencher/alterar unit automaticamente
    if (meta.field === 'unit') {
      if (result.occupationalData.targetUnit) {
        action = filled ? 'SKIP_EXISTING' : 'SKIP_EMPTY_SOURCE';
      } else if (!isFilled(prefill.unit)) {
        action =
          result.occupationalData.unitConflict ||
          result.occupationalData.unitReviewRequired
            ? 'SKIP_UNIT_REVIEW'
            : 'SKIP_EMPTY_SOURCE';
      } else if (filled) {
        action = divergent ? 'SKIP_DIVERGENCE' : 'SKIP_EXISTING';
      } else {
        action = 'FILL';
      }
    }

    const conversion = trace?.conversion
      ? {
          molecularWeight: trace.conversion.molecularWeight,
          molecularWeightSource: trace.conversion.molecularWeightSource,
          temperatureC: trace.conversion.temperatureC,
          pressureAtm: trace.conversion.pressureAtm,
          formula: trace.conversion.formula,
          originalValue: trace.conversion.originalValue,
          originalUnit: trace.conversion.originalUnit,
          convertedValue: trace.conversion.convertedValue,
          convertedUnit: trace.conversion.convertedUnit,
          verificationStatus: trace.conversion.verificationStatus,
        }
      : null;

    return {
      field: meta.field,
      label: meta.label,
      group: meta.group,
      currentValue: currentValue ? String(currentValue) : null,
      foundRaw,
      foundFormValue: foundFormValue ? String(foundFormValue) : null,
      foundUnit: trace?.unit || null,
      applyStatus,
      sourceName: trace?.sourceName || null,
      sourceField: trace?.sourceField || null,
      sourceUrl: trace?.sourceUrl || null,
      alternateRepresentations: trace?.alternateRepresentations || [],
      conversion,
      action,
      divergent,
    };
  });
}

export function buildOccupationalFormPatch(
  rows: OccupationalReviewRow[],
  result: ChemicalOccupationalEnrichResult,
  current: OccupationalLimitFormSnapshot,
): OccupationalLimitFormSnapshot {
  const patch: OccupationalLimitFormSnapshot = {};

  for (const row of rows) {
    if (row.action !== 'FILL' || !row.foundFormValue) continue;
    (patch as any)[row.field] = row.foundFormValue;
  }

  // json.ipvs somente se IPVS for FILL e não houver json.ipvs destrutivo
  const ipvsRow = rows.find((r) => r.field === 'ipvs');
  if (ipvsRow?.action === 'FILL' && result.prefill.json?.ipvs) {
    patch.json = {
      ...(current.json || {}),
      ipvs: {
        ...(current.json?.ipvs || {}),
        ...result.prefill.json.ipvs,
      },
    };
  }

  return patch;
}

export function assertNoLegacyLimitString(value: string | null | undefined): boolean {
  if (!value) return true;
  // Legado: número + unidade concatenados, ou parêntese com segunda unidade
  if (/\d\s*(ppm|mg\/m)/i.test(value)) return false;
  if (/\(.*mg\/m/i.test(value)) return false;
  return true;
}
