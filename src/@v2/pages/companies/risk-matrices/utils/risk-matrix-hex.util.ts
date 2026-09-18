const HEX_6 = /^#?([0-9a-fA-F]{6})$/;
const HEX_3 = /^#?([0-9a-fA-F]{3})$/;

export function normalizeRiskMatrixHex(raw: string | null | undefined) {
  const value = raw?.trim() ?? '';
  if (!value || value.toLowerCase() === 'transparent') return null;

  const match6 = value.match(HEX_6);
  if (match6) return `#${match6[1].toUpperCase()}`;

  const match3 = value.match(HEX_3);
  if (match3) {
    const [r, g, b] = match3[1];
    return `#${r}${r}${g}${g}${b}${b}`.toUpperCase();
  }

  return null;
}

export function isValidRiskMatrixHex(raw: string | null | undefined) {
  return Boolean(normalizeRiskMatrixHex(raw));
}

export const RISK_MATRIX_SUGGESTED_COLORS = [
  '#000000',
  '#800000',
  '#B13A41',
  '#E50000',
  '#E91E63',
  '#9C27B0',
  '#673AB7',
  '#3F51B5',
  '#4466FF',
  '#2196F3',
  '#03A9F4',
  '#00BCD4',
  '#64C6A2',
  '#1BB742',
  '#8BC34A',
  '#FFEB3B',
  '#FFC107',
  '#FF9800',
  '#CF940A',
  '#AF7E2E',
  '#FF5722',
  '#795548',
  '#9E9E9E',
  '#607D8B',
] as const;
