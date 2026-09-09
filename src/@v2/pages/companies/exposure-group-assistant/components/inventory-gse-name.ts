const TITLE_CASE_SMALL = new Set(['de', 'da', 'do', 'das', 'dos', 'e', 'em', 'com']);

export const INVENTORY_GSE_PERSISTED_PREFIX = 'GSE';
export const INVENTORY_GSE_PERSISTED_SEPARATOR = ' — ';

function toDisplayName(value: string): string {
  const compact = value.replace(/\s+/g, ' ').trim();
  if (!compact) return '';
  let wordIndex = 0;
  return compact
    .split(/(\s+|\/)/)
    .map((part) => {
      if (!part || /^\s+$/.test(part) || part === '/') return part;
      const lower = part.toLocaleLowerCase('pt-BR');
      const display =
        wordIndex > 0 && TITLE_CASE_SMALL.has(lower)
          ? lower
          : `${lower.charAt(0).toLocaleUpperCase('pt-BR')}${lower.slice(1)}`;
      wordIndex += 1;
      return display;
    })
    .join('');
}

export function normalizeInventoryGseSourceCode(
  sourceCode?: string | null,
): string {
  const trimmed = (sourceCode || '').trim();
  if (!trimmed) return '';
  const parsed = Number.parseInt(trimmed, 10);
  return Number.isFinite(parsed) ? String(parsed) : trimmed;
}

export function formatInventoryGsePersistedName(input: {
  sourceCode?: string | null;
  sourceName?: string | null;
}): string {
  const code = normalizeInventoryGseSourceCode(input.sourceCode);
  const semantic = toDisplayName(input.sourceName || '');
  if (code && semantic) {
    return `${INVENTORY_GSE_PERSISTED_PREFIX} ${code}${INVENTORY_GSE_PERSISTED_SEPARATOR}${semantic}`;
  }
  if (semantic) return semantic;
  if (code) return `${INVENTORY_GSE_PERSISTED_PREFIX} ${code}`;
  return '';
}

export function formatInventoryGseDocumentLabel(input: {
  sourceLabel?: string | null;
  sourceCode?: string | null;
  sourceName?: string | null;
}): string {
  const label = (input.sourceLabel || '').trim();
  const name = (input.sourceName || '').trim();
  if (label && name) return `${label}${INVENTORY_GSE_PERSISTED_SEPARATOR}${name}`;
  return label || name || '—';
}

export function isHumanInventoryGseNameOverride(
  appliedName: string | null | undefined,
  computedDefault: string,
): boolean {
  const applied = (appliedName || '').trim();
  if (!applied) return false;
  return (
    applied.localeCompare(computedDefault, 'pt-BR', { sensitivity: 'accent' }) !==
      0 &&
    applied.toLocaleUpperCase('pt-BR') !== computedDefault.toLocaleUpperCase('pt-BR')
  );
}

export function resolveInventoryGsePersistedName(input: {
  sourceCode?: string | null;
  sourceName?: string | null;
  appliedName?: string | null;
}): string {
  const computed = formatInventoryGsePersistedName(input);
  if (isHumanInventoryGseNameOverride(input.appliedName, computed)) {
    return (input.appliedName || '').trim();
  }
  return computed;
}
