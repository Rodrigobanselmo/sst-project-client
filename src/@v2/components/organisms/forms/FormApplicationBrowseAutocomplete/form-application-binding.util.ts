/**
 * Contrato Client ↔ API para formApplicationId.
 *
 * Create: omitir quando não houver seleção (undefined).
 * Regenerate: string substitui; null remove; omitido preserva (API).
 */

export type FormApplicationPickerStatus =
  | 'idle'
  | 'loading'
  | 'ready'
  | 'error';

export function resolveFormApplicationIdForCreate(
  value: string | null,
): string | undefined {
  return value || undefined;
}

/** Sempre envia string ou null na regeneração — nunca converte null em omit. */
export function resolveFormApplicationIdForRegenerate(
  value: string | null,
): string | null {
  return value;
}

export type FormApplicationOption = {
  label: string;
  value: string;
  secondary?: string;
};

export function mergeHydratedFormApplicationOption(
  options: FormApplicationOption[],
  hydrated: FormApplicationOption | null,
): FormApplicationOption[] {
  if (!hydrated) return options;
  if (options.some((option) => option.value === hydrated.value)) {
    return options;
  }
  return [hydrated, ...options];
}

export function resolveSelectedFormApplicationOption(
  value: string | null | undefined,
  options: FormApplicationOption[],
): FormApplicationOption | null {
  if (!value) return null;
  return options.find((option) => option.value === value) ?? null;
}
