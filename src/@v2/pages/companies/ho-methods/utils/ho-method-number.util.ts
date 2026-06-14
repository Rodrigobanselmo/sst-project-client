export function parseLocaleDecimal(value?: string | number | null): number | null {
  if (value == null) return null;
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null;
  }

  const normalized = value
    .trim()
    .replace(/\s+/g, '')
    .replace(/ppm|mg\/m³|mg\/m3|µg\/m³|µg\/m3/gi, '')
    .replace(',', '.');

  if (!normalized || normalized === '.' || normalized === '-.') return null;

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

export function extractNumericToken(value?: string | null): string | null {
  if (!value?.trim()) return null;

  const match = value.replace(',', '.').match(/-?\d+(\.\d+)?/);
  return match?.[0] ?? null;
}

export function isValidLocaleDecimalInput(value?: string | null): boolean {
  if (value == null || value.trim() === '') return true;
  return parseLocaleDecimal(value) != null;
}

export function normalizePayloadDecimals<T extends Record<string, unknown>>(
  payload: T,
  keys: (keyof T)[],
): T {
  const next = { ...payload };

  for (const key of keys) {
    const raw = next[key];
    if (typeof raw === 'string') {
      next[key] = parseLocaleDecimal(raw) as T[keyof T];
    }
  }

  return next;
}
