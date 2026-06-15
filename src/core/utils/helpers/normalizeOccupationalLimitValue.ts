const OCCUPATIONAL_LIMIT_PLACEHOLDERS = new Set(['-', '--']);

export function normalizeOccupationalLimitValue(
  value?: string | null,
): string | null {
  if (value == null) return null;

  const trimmed = value.trim();
  if (!trimmed || OCCUPATIONAL_LIMIT_PLACEHOLDERS.has(trimmed)) return null;

  return trimmed;
}

export function hasOccupationalLimitValue(value?: string | null): boolean {
  return normalizeOccupationalLimitValue(value) != null;
}
