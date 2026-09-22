/**
 * Client contract for CompanyRiskMatrixClassification.abbreviation (A1/A2).
 *
 * Storage/API: trim + uppercase, length 1..4, charset A-Z0-9.
 * Uniqueness is per matrix version only — SYSTEM shorts are not reserved.
 */

export const RISK_MATRIX_CLASSIFICATION_ABBREVIATION_MIN_LENGTH = 1;
export const RISK_MATRIX_CLASSIFICATION_ABBREVIATION_MAX_LENGTH = 4;

const STORED_PATTERN = /^[A-Z0-9]+$/;

/** Normalize for payload / comparison (trim + uppercase). Does not strip invalid chars. */
export function normalizeRiskMatrixClassificationAbbreviation(
  raw: string | null | undefined,
): string {
  return typeof raw === 'string' ? raw.trim().toUpperCase() : '';
}

/**
 * Live input sanitizer for the Sigla field: keep A-Z0-9 only, uppercase, max 4.
 * Spaces and punctuation are dropped as the user types.
 */
export function sanitizeRiskMatrixClassificationAbbreviationInput(
  raw: string,
): string {
  return String(raw ?? '')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, RISK_MATRIX_CLASSIFICATION_ABBREVIATION_MAX_LENGTH);
}

export function isValidRiskMatrixClassificationAbbreviationFormat(
  value: string,
): boolean {
  if (
    value.length < RISK_MATRIX_CLASSIFICATION_ABBREVIATION_MIN_LENGTH ||
    value.length > RISK_MATRIX_CLASSIFICATION_ABBREVIATION_MAX_LENGTH
  ) {
    return false;
  }
  return STORED_PATTERN.test(value);
}

export function findDuplicateClassificationAbbreviations(
  items: Array<{ key: string; abbreviation: string }>,
): string[] {
  const seen = new Map<string, string>();
  const duplicates = new Set<string>();

  for (const item of items) {
    const abbreviation = normalizeRiskMatrixClassificationAbbreviation(
      item.abbreviation,
    );
    if (!abbreviation) continue;
    const previousKey = seen.get(abbreviation);
    if (previousKey && previousKey !== item.key) {
      duplicates.add(abbreviation);
    } else {
      seen.set(abbreviation, item.key);
    }
  }

  return [...duplicates].sort();
}

export function formatClassificationDisplayLabel(params: {
  label: string;
  abbreviation?: string | null;
  fallback?: string;
}): string {
  const label = params.label.trim() || params.fallback || 'Sem nome';
  const abbreviation = normalizeRiskMatrixClassificationAbbreviation(
    params.abbreviation,
  );
  if (!abbreviation) return label;
  return `${abbreviation} — ${label}`;
}
