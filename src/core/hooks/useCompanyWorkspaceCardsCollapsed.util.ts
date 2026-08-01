/**
 * Preferência global dos cards do workspace da empresa (browser-local).
 * Valor: `true` = cards ocultos; `false` = cards visíveis.
 * Independente da seção "Detalhes" do cabeçalho.
 */

export const COMPANY_WORKSPACE_CARDS_COLLAPSED_STORAGE_KEY =
  'companyWorkspaceCardsCollapsed';

/** Chave legada da Caracterização — lida apenas para migração. */
export const COMPANY_WORKSPACE_CARDS_COLLAPSED_LEGACY_STORAGE_KEY =
  'characterizationSummaryCollapsed';

export const COMPANY_WORKSPACE_CARDS_COLLAPSED_DEFAULT = false;

export function parseCompanyWorkspaceCardsCollapsed(
  raw: string | null | undefined,
): boolean {
  if (raw == null || raw === '') {
    return COMPANY_WORKSPACE_CARDS_COLLAPSED_DEFAULT;
  }

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (typeof parsed === 'boolean') return parsed;
  } catch {
    // valor inválido
  }

  if (raw === 'true') return true;
  if (raw === 'false') return false;

  return COMPANY_WORKSPACE_CARDS_COLLAPSED_DEFAULT;
}

/**
 * Lê a preferência: nova chave primeiro; se ausente, migra a legada.
 * SSR-safe (sem window → default).
 */
export function readCompanyWorkspaceCardsCollapsed(): boolean {
  if (typeof window === 'undefined') {
    return COMPANY_WORKSPACE_CARDS_COLLAPSED_DEFAULT;
  }

  try {
    const nextRaw = localStorage.getItem(
      COMPANY_WORKSPACE_CARDS_COLLAPSED_STORAGE_KEY,
    );
    if (nextRaw != null && nextRaw !== '') {
      return parseCompanyWorkspaceCardsCollapsed(nextRaw);
    }

    const legacyRaw = localStorage.getItem(
      COMPANY_WORKSPACE_CARDS_COLLAPSED_LEGACY_STORAGE_KEY,
    );
    if (legacyRaw != null && legacyRaw !== '') {
      const migrated = parseCompanyWorkspaceCardsCollapsed(legacyRaw);
      writeCompanyWorkspaceCardsCollapsed(migrated);
      return migrated;
    }

    return COMPANY_WORKSPACE_CARDS_COLLAPSED_DEFAULT;
  } catch {
    return COMPANY_WORKSPACE_CARDS_COLLAPSED_DEFAULT;
  }
}

export function writeCompanyWorkspaceCardsCollapsed(collapsed: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(
      COMPANY_WORKSPACE_CARDS_COLLAPSED_STORAGE_KEY,
      JSON.stringify(collapsed),
    );
  } catch {
    // quota / private mode — ignora
  }
}

export function getCompanyWorkspaceCardsToggleLabel(
  collapsed: boolean,
): string {
  return collapsed ? 'Mostrar cards' : 'Ocultar cards';
}

/** @deprecated Use COMPANY_WORKSPACE_CARDS_COLLAPSED_STORAGE_KEY */
export const CHARACTERIZATION_SUMMARY_COLLAPSED_STORAGE_KEY =
  COMPANY_WORKSPACE_CARDS_COLLAPSED_LEGACY_STORAGE_KEY;

/** @deprecated */
export const CHARACTERIZATION_SUMMARY_COLLAPSED_DEFAULT =
  COMPANY_WORKSPACE_CARDS_COLLAPSED_DEFAULT;

/** @deprecated */
export const parseCharacterizationSummaryCollapsed =
  parseCompanyWorkspaceCardsCollapsed;

/** @deprecated */
export const readCharacterizationSummaryCollapsed =
  readCompanyWorkspaceCardsCollapsed;

/** @deprecated */
export const writeCharacterizationSummaryCollapsed =
  writeCompanyWorkspaceCardsCollapsed;

/** @deprecated */
export const getCharacterizationSummaryToggleLabel =
  getCompanyWorkspaceCardsToggleLabel;
