import deepEqual from 'deep-equal';

import { cleanObjectValues } from 'core/utils/helpers/cleanObjectValues';

type CharacterizationDirtyForm = {
  name?: unknown;
  description?: unknown;
  type?: unknown;
  profileName?: unknown;
  riskInventorySummary?: unknown;
  noiseValue?: unknown;
  temperature?: unknown;
  luminosity?: unknown;
  moisturePercentage?: unknown;
};

const pickFormOrData = (
  form: CharacterizationDirtyForm,
  data: Record<string, unknown>,
  key: keyof CharacterizationDirtyForm,
) => {
  const formValue = form[key];
  if (formValue !== undefined) return formValue;
  return data[key];
};

const resolvePhotoCount = (
  data: Record<string, unknown>,
  photoCount?: number,
) => {
  if (typeof photoCount === 'number') return photoCount;
  if (typeof data.photos === 'number') return data.photos;
  return Array.isArray(data.photos) ? data.photos.length : 0;
};

export function getCharacterizationEditorSnapshot(params: {
  current: object;
  form?: CharacterizationDirtyForm;
  photoCount?: number;
}) {
  const data = (params.current || {}) as Record<string, unknown>;
  const form = params.form || {};
  const profiles = Array.isArray(data.profiles) ? data.profiles : [];

  return cleanObjectValues({
    name: pickFormOrData(form, data, 'name'),
    description: pickFormOrData(form, data, 'description'),
    type: pickFormOrData(form, data, 'type'),
    profileName: pickFormOrData(form, data, 'profileName'),
    riskInventorySummary: pickFormOrData(form, data, 'riskInventorySummary'),
    noiseValue: pickFormOrData(form, data, 'noiseValue'),
    temperature: pickFormOrData(form, data, 'temperature'),
    luminosity: pickFormOrData(form, data, 'luminosity'),
    moisturePercentage: pickFormOrData(form, data, 'moisturePercentage'),
    paragraphs: data.paragraphs || [],
    activities: data.activities || [],
    considerations: data.considerations || [],
    order: data.order,
    status: data.status,
    photos: resolvePhotoCount(data, params.photoCount),
    profiles: profiles
      .map((profile) => (profile as { id?: string })?.id)
      .filter(Boolean)
      .sort(),
  });
}

export function isCharacterizationEditorDirty(params: {
  current: object;
  baseline: object;
  form: CharacterizationDirtyForm;
  photoCount?: number;
  baselinePhotoCount?: number;
}): boolean {
  const afterObject = getCharacterizationEditorSnapshot({
    current: params.current,
    form: params.form,
    photoCount: params.photoCount,
  });
  const beforeObject = getCharacterizationEditorSnapshot({
    current: params.baseline,
    photoCount: params.baselinePhotoCount,
  });

  return !deepEqual(afterObject, beforeObject);
}
