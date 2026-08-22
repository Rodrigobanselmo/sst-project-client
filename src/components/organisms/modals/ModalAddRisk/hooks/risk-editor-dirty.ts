import deepEqual from 'deep-equal';

import { cleanObjectValues } from 'core/utils/helpers/cleanObjectValues';

const RISK_SNAPSHOT_OMIT = new Set([
  'hasSubmit',
  'callback',
  'passBack',
  'isAddRecMed',
  'isAddGenerateSource',
  'remove',
  'edit',
]);

export function overlayDefinedFormValues<
  TData extends object,
  TForm extends object,
>(data: TData, form: TForm): TData & TForm {
  const next = { ...data } as TData & TForm;
  Object.entries(form || {}).forEach(([key, value]) => {
    if (value === undefined) return;
    (next as Record<string, unknown>)[key] = value;
  });
  return next;
}

export function getRiskEditorSnapshot<
  TData extends object,
  TForm extends object,
>(data: TData, form: TForm) {
  const merged = overlayDefinedFormValues(data, form) as Record<string, unknown>;
  RISK_SNAPSHOT_OMIT.forEach((key) => {
    delete merged[key];
  });

  if (merged.severity !== undefined && merged.severity !== null && merged.severity !== '') {
    const severity = Number(merged.severity);
    merged.severity = Number.isFinite(severity) ? severity : merged.severity;
  }

  return cleanObjectValues(merged);
}

export function isRiskEditorDirty(current: unknown, baseline: unknown): boolean {
  return !deepEqual(
    cleanObjectValues((current || {}) as object),
    cleanObjectValues((baseline || {}) as object),
  );
}

export function getRiskEditorDirtySnapshot<
  TData extends object,
  TForm extends object,
>(data: TData, form: TForm) {
  return getRiskEditorSnapshot(data, form);
}
