/**
 * Preferência global de expansão das seções principais da sidebar (browser-local).
 * Independente de empresa, estabelecimento ou módulo.
 * Chaves estáveis — não usar o rótulo exibido na UI.
 */

export const SIDEBAR_SECTION_EXPANSION_STORAGE_KEY =
  'sidebarSectionExpansionState';

export const SIDEBAR_SECTION_IDS = [
  'general',
  'companyManagement',
  'operations',
  'technicalRegistrations',
  'librariesAndCuration',
  'administration',
] as const;

export type SidebarSectionId = (typeof SIDEBAR_SECTION_IDS)[number];

export type SidebarSectionExpansionState = Partial<
  Record<SidebarSectionId, boolean>
>;

/** Sem preferência salva → seção inicia expandida. */
export const SIDEBAR_SECTION_EXPANDED_DEFAULT = true;

export function isSidebarSectionId(value: unknown): value is SidebarSectionId {
  return (
    typeof value === 'string' &&
    (SIDEBAR_SECTION_IDS as readonly string[]).includes(value)
  );
}

/**
 * Parse SSR-safe. Conteúdo inválido/incompleto → objeto parcial;
 * chaves ausentes são tratadas como expandido em `isSidebarSectionExpanded`.
 */
export function parseSidebarSectionExpansionState(
  raw: string | null | undefined,
): SidebarSectionExpansionState {
  if (raw == null || raw === '') {
    return {};
  }

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return {};
    }

    const result: SidebarSectionExpansionState = {};
    for (const id of SIDEBAR_SECTION_IDS) {
      const value = (parsed as Record<string, unknown>)[id];
      if (typeof value === 'boolean') {
        result[id] = value;
      }
    }
    return result;
  } catch {
    return {};
  }
}

export function isSidebarSectionExpanded(
  state: SidebarSectionExpansionState,
  id: SidebarSectionId,
): boolean {
  const value = state[id];
  if (typeof value !== 'boolean') {
    return SIDEBAR_SECTION_EXPANDED_DEFAULT;
  }
  return value;
}

/** SSR-safe: sem window → estado vazio (defaults = todos abertos). */
export function readSidebarSectionExpansionState(): SidebarSectionExpansionState {
  if (typeof window === 'undefined') {
    return {};
  }

  try {
    return parseSidebarSectionExpansionState(
      localStorage.getItem(SIDEBAR_SECTION_EXPANSION_STORAGE_KEY),
    );
  } catch {
    return {};
  }
}

export function writeSidebarSectionExpansionState(
  state: SidebarSectionExpansionState,
): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(
      SIDEBAR_SECTION_EXPANSION_STORAGE_KEY,
      JSON.stringify(state),
    );
  } catch {
    // quota / private mode — ignora
  }
}

export function getSidebarSectionToggleLabel(
  title: string,
  expanded: boolean,
): string {
  return expanded ? `Recolher ${title}` : `Expandir ${title}`;
}

export function sidebarSectionPanelId(id: SidebarSectionId): string {
  return `sidebar-section-panel-${id}`;
}
