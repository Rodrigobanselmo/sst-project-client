// SURVEY quantities preserve Excel's formatted text. A grouped comma is a
// thousands separator, and a dot is decimal in stored values without grouping.
export function normalizeChemicalScenarioQuantity(raw?: string | null) {
  const value = raw?.trim() ?? '';
  if (/^[1-9]\d{0,2}(?:,\d{3})+(?:\.\d+)?$/.test(value)) {
    return value.replaceAll(',', '');
  }
  if (/^[1-9]\d{0,2}(?:\.\d{3})+,\d+$/.test(value)) {
    return value.replaceAll('.', '').replace(',', '.');
  }
  if (/^\d+(?:[.,]\d+)?(?:e[+-]?\d+)?$/i.test(value)) {
    return value.replace(',', '.');
  }
  return null;
}

export function parseChemicalScenarioQuantity(raw?: string | null) {
  const normalized = normalizeChemicalScenarioQuantity(raw);
  const value = normalized === null ? NaN : Number(normalized);
  return Number.isFinite(value) ? value : null;
}

export function formatChemicalScenarioQuantity(raw?: string | null) {
  const normalized = normalizeChemicalScenarioQuantity(raw);
  if (!normalized) return raw?.trim() || '';
  const [mantissa, exponent] = normalized.split(/e/i);
  const [whole, fraction] = mantissa.split('.');
  const integer = whole.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const decimal = fraction === undefined ? integer : `${integer},${fraction}`;
  return exponent === undefined ? decimal : `${decimal}e${exponent}`;
}
