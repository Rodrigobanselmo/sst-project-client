import { resolveLinkedRiskSubTypeId } from 'core/utils/risk-subtype-display.util';

import { toRiskFormSeverity } from './risk-form-severity';

/**
 * Campos técnicos ausentes em GET /risk/company. O lápis abre o modal com a
 * linha da lista (nome e severidade) e o registro completo chega depois.
 */
const DETAIL_FIELDS = [
  'risk',
  'symptoms',
  'affectedRegion',
  'absorptionRoutes',
  'synonymous',
  'method',
  'propagation',
  'esocial',
  'unit',
  'cas',
  'nr15lt',
  'twa',
  'stel',
  'acgihCeiling',
  'ipvs',
  'nioshRel',
  'nioshStel',
  'nioshCeiling',
  'oshaPel',
  'oshaStel',
  'oshaCeiling',
  'aihaWeel',
  'aihaWeelStel',
  'aihaWeelCeiling',
  'json',
  'pv',
  'pe',
  'breather',
  'coments',
  'fraction',
  'tlv',
  'otherAppendix',
  'appendix',
  'carnogenicityACGIH',
  'carnogenicityLinach',
  'activities',
  'grauInsalubridade',
  'recMed',
  'generateSource',
  'isEmergency',
  'system',
  'representAll',
] as const;

const FORM_FIELDS = new Set<string>([
  'risk',
  'symptoms',
  'affectedRegion',
  'absorptionRoutes',
  'method',
  'unit',
  'cas',
  'nr15lt',
  'twa',
  'stel',
  'acgihCeiling',
  'ipvs',
  'nioshRel',
  'nioshStel',
  'nioshCeiling',
  'oshaPel',
  'oshaStel',
  'oshaCeiling',
  'aihaWeel',
  'aihaWeelStel',
  'aihaWeelCeiling',
  'pv',
  'pe',
  'breather',
  'coments',
  'fraction',
  'tlv',
  'otherAppendix',
  'appendix',
  'carnogenicityACGIH',
  'carnogenicityLinach',
  'synonymous',
  'propagation',
  'severity',
  'subType',
]);

export function isBlankRiskFactorField(value: unknown, field?: string): boolean {
  if (field === 'severity') {
    const severity = Number(value);
    return !Number.isInteger(severity) || severity < 1 || severity > 5;
  }

  if (value == null) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  return false;
}

export function canHydrateRiskFactorFromDetail(
  editor: { id?: string; isDuplicateDraft?: boolean; asLocalCompanyCopy?: boolean },
  loaded: { id?: string } | null | undefined,
  modalData?: { id?: unknown; isDuplicateDraft?: boolean; asLocalCompanyCopy?: boolean } | null,
): boolean {
  if (!loaded?.id || !editor?.id || loaded.id !== editor.id) return false;
  if (editor.isDuplicateDraft || editor.asLocalCompanyCopy) return false;
  if (modalData?.isDuplicateDraft || modalData?.asLocalCompanyCopy) return false;
  if (typeof modalData?.id === 'string' && modalData.id !== loaded.id) return false;
  return true;
}

function sameRiskFactorValue(left: unknown, right: unknown): boolean {
  if (Object.is(left, right)) return true;
  if (Array.isArray(left) || Array.isArray(right) || (left && right && typeof left === 'object')) {
    try {
      return JSON.stringify(left) === JSON.stringify(right);
    } catch {
      return false;
    }
  }
  return false;
}

function formValueFor(field: string, value: unknown): unknown {
  if (field === 'severity') return toRiskFormSeverity(value) || '';
  if (field === 'synonymous') {
    return Array.isArray(value) ? value.join('; ') : value;
  }
  if (field === 'propagation') {
    return Array.isArray(value) ? value.join(', ') : value;
  }
  return value;
}

export function hydrateRiskFactorFromDetail<T extends Record<string, any>>(
  editor: T,
  loaded: Record<string, any> | null | undefined,
  isFieldDirty: (name: string) => boolean,
  modalData?: { id?: unknown; isDuplicateDraft?: boolean; asLocalCompanyCopy?: boolean } | null,
): { editor: T; formValues: Record<string, unknown>; changed: boolean } {
  if (!canHydrateRiskFactorFromDetail(editor, loaded, modalData) || !loaded) {
    return { editor, formValues: {}, changed: false };
  }

  const next = { ...editor } as Record<string, unknown>;
  const formValues: Record<string, unknown> = {};
  let changed = false;

  const assign = (field: string, value: unknown) => {
    if (isFieldDirty(field) || isBlankRiskFactorField(value, field)) return;
    if (sameRiskFactorValue(next[field], value)) return;
    next[field] = value;
    if (FORM_FIELDS.has(field)) formValues[field] = formValueFor(field, value);
    changed = true;
  };

  for (const field of DETAIL_FIELDS) {
    assign(field, loaded[field]);
  }

  assign('severity', loaded.severity);

  const subType = resolveLinkedRiskSubTypeId(loaded);
  if (subType) assign('subType', subType);

  return { editor: next as T, formValues, changed };
}
