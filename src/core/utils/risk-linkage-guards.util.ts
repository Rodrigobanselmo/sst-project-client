/** Safe label for characterization / GHO rows when description may be null. */
export function characterizationDisplayName(
  description?: string | null,
  name?: string | null,
): string {
  return description?.split('(//)')[0] || name || '';
}

export const RISK_LINKAGE_EMPTY_MESSAGE =
  'Nenhum fator de risco vinculado a esta entidade.';

/** Side list must tolerate undefined query payloads from loading/error states. */
export function coerceGhoQueryList<T>(ghoQuery: T[] | null | undefined): T[] {
  return ghoQuery ?? [];
}
