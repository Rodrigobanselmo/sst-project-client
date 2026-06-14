import { parseLocaleDecimal, extractNumericToken } from './ho-method-number.util';

export function getNr15DeviationFactor(limitValue: number): number {
  if (limitValue <= 1) return 3;
  if (limitValue <= 10) return 2;
  if (limitValue <= 100) return 1.5;
  if (limitValue <= 1000) return 1.25;
  return 1.1;
}

export function calculateNr15Vmp(limitValue: number) {
  const fd = getNr15DeviationFactor(limitValue);
  const vmp = Number((limitValue * fd).toFixed(4));

  return {
    lt: limitValue,
    fd,
    vmp,
  };
}

export function hasNr15TetoMarker(value?: string | null): boolean {
  if (!value?.trim()) return false;
  const normalized = value.trim();

  return (
    /\bT(eto)?\b/i.test(normalized) ||
    /\bT$/i.test(normalized) ||
    /\(T\)/i.test(normalized)
  );
}

export function hasAcgihCeilingMarker(value?: string | null): boolean {
  if (!value?.trim()) return false;
  const normalized = value.trim();

  return (
    /\bC(eiling)?\b/i.test(normalized) ||
    /\bC$/i.test(normalized) ||
    /\(C\)/i.test(normalized)
  );
}

export function parseNr15NumericLimit(value?: string | null): number | null {
  if (!value?.trim() || hasNr15TetoMarker(value)) return null;

  const token = extractNumericToken(value);
  return token ? parseLocaleDecimal(token) : null;
}

export function formatVmpHelperText(lt: number, unit?: string | null) {
  const { fd, vmp } = calculateNr15Vmp(lt);
  const unitSuffix = unit ? ` ${unit}` : '';

  return `LT: ${lt}${unitSuffix} × FD ${String(fd).replace('.', ',')} = VMP ${String(vmp).replace('.', ',')}${unitSuffix}`;
}
