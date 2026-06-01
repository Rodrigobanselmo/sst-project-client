import { removeAccents } from '@v2/utils/remove-accesnts';

const TRAILING_PUNCTUATION_PATTERN = /[.,;:]+$/;

function stripTrailingPunctuation(value: string): string {
  let result = value;
  while (TRAILING_PUNCTUATION_PATTERN.test(result)) {
    result = result.replace(TRAILING_PUNCTUATION_PATTERN, '').trimEnd();
  }
  return result;
}

/**
 * Normalização para equivalência de fontes geradoras / recomendações (catálogo e inventário).
 * Alinhado à API (`shared/utils/normalize-inventory-item-name.util.ts`).
 */
export function normalizeInventoryItemName(
  name: string | undefined | null,
): string {
  if (!name) return '';

  const collapsed = name
    .replace(/\r\n/g, '\n')
    .replace(/[\n\r\t]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');

  const lower = removeAccents(collapsed.toLowerCase());
  return stripTrailingPunctuation(lower);
}
