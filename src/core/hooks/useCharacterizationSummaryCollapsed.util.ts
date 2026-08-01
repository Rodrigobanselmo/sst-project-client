/**
 * Preferência de layout dos cards superiores da Caracterização (browser-local).
 * Valor persistido: `true` = cards ocultos; `false` = cards visíveis.
 * Independente da seção "Detalhes" do cabeçalho da empresa.
 */

export const CHARACTERIZATION_SUMMARY_COLLAPSED_STORAGE_KEY =
  'characterizationSummaryCollapsed';

export const CHARACTERIZATION_SUMMARY_COLLAPSED_DEFAULT = false;

export function parseCharacterizationSummaryCollapsed(
  raw: string | null | undefined,
): boolean {
  if (raw == null || raw === '') {
    return CHARACTERIZATION_SUMMARY_COLLAPSED_DEFAULT;
  }

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (typeof parsed === 'boolean') return parsed;
  } catch {
    // valor inválido
  }

  if (raw === 'true') return true;
  if (raw === 'false') return false;

  return CHARACTERIZATION_SUMMARY_COLLAPSED_DEFAULT;
}

export function readCharacterizationSummaryCollapsed(): boolean {
  if (typeof window === 'undefined') {
    return CHARACTERIZATION_SUMMARY_COLLAPSED_DEFAULT;
  }

  try {
    return parseCharacterizationSummaryCollapsed(
      localStorage.getItem(CHARACTERIZATION_SUMMARY_COLLAPSED_STORAGE_KEY),
    );
  } catch {
    return CHARACTERIZATION_SUMMARY_COLLAPSED_DEFAULT;
  }
}

export function writeCharacterizationSummaryCollapsed(collapsed: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(
      CHARACTERIZATION_SUMMARY_COLLAPSED_STORAGE_KEY,
      JSON.stringify(collapsed),
    );
  } catch {
    // quota / private mode — ignora
  }
}

export function getCharacterizationSummaryToggleLabel(
  collapsed: boolean,
): string {
  return collapsed ? 'Mostrar cards' : 'Ocultar cards';
}
