import deepEqual from 'deep-equal';

const draftFields = [
  'name',
  'description',
  'type',
  'profileName',
  'riskInventorySummary',
  'noiseValue',
  'temperature',
  'luminosity',
  'moisturePercentage',
  'activities',
  'paragraphs',
  'considerations',
  'order',
  'status',
] as const;

const comparable = (value: unknown) =>
  value == null || value === '' ? null : value;

/** Campos ainda não montados recebem o remoto; vazio digitado também é rascunho. */
export function canHydrateCharacterizationField(
  current: unknown,
  baseline: unknown,
): boolean {
  return (
    current === undefined ||
    deepEqual(comparable(current), comparable(baseline))
  );
}

/** Atualiza dados carregados sem transformar a nova resposta em autosave do rascunho. */
export function mergeCharacterizationDraft<T extends object>(params: {
  current: T;
  baseline: object;
  incoming: object;
}): T {
  const merged = { ...params.current, ...params.incoming };
  const current = params.current as Record<string, unknown>;
  const baseline = params.baseline as Record<string, unknown>;
  for (const field of draftFields) {
    if (!canHydrateCharacterizationField(current[field], baseline[field]))
      (merged as Record<string, unknown>)[field] = current[field];
  }
  return merged;
}
