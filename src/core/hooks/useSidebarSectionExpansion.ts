import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  isSidebarSectionExpanded,
  readSidebarSectionExpansionState,
  SIDEBAR_SECTION_EXPANSION_STORAGE_KEY,
  type SidebarSectionExpansionState,
  type SidebarSectionId,
  writeSidebarSectionExpansionState,
} from './useSidebarSectionExpansion.util';

export {
  getSidebarSectionToggleLabel,
  isSidebarSectionExpanded,
  isSidebarSectionId,
  parseSidebarSectionExpansionState,
  readSidebarSectionExpansionState,
  SIDEBAR_SECTION_EXPANDED_DEFAULT,
  SIDEBAR_SECTION_EXPANSION_STORAGE_KEY,
  SIDEBAR_SECTION_IDS,
  sidebarSectionPanelId,
  writeSidebarSectionExpansionState,
  type SidebarSectionExpansionState,
  type SidebarSectionId,
} from './useSidebarSectionExpansion.util';

export type UseSidebarSectionExpansionResult = {
  /** true após hidratar do localStorage no client. */
  hydrated: boolean;
  state: SidebarSectionExpansionState;
  storageKey: string;
  isExpanded: (id: SidebarSectionId) => boolean;
  setExpanded: (id: SidebarSectionId, expanded: boolean) => void;
  toggleExpanded: (id: SidebarSectionId) => void;
  /** Abre a seção e persiste se estava recolhida (rota ativa). */
  ensureExpanded: (id: SidebarSectionId) => void;
};

/**
 * Fonte única de verdade para expansão das seções principais da sidebar.
 * Persistência em localStorage é consequência das mutações de estado.
 */
export function useSidebarSectionExpansion(): UseSidebarSectionExpansionResult {
  const [state, setState] = useState<SidebarSectionExpansionState>({});
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setState(readSidebarSectionExpansionState());
    setHydrated(true);
  }, []);

  const isExpanded = useCallback(
    (id: SidebarSectionId) => isSidebarSectionExpanded(state, id),
    [state],
  );

  const setExpanded = useCallback((id: SidebarSectionId, expanded: boolean) => {
    setState((prev) => {
      const next = { ...prev, [id]: expanded };
      writeSidebarSectionExpansionState(next);
      return next;
    });
  }, []);

  const toggleExpanded = useCallback((id: SidebarSectionId) => {
    setState((prev) => {
      const current = isSidebarSectionExpanded(prev, id);
      const next = { ...prev, [id]: !current };
      writeSidebarSectionExpansionState(next);
      return next;
    });
  }, []);

  const ensureExpanded = useCallback((id: SidebarSectionId) => {
    setState((prev) => {
      if (isSidebarSectionExpanded(prev, id)) {
        return prev;
      }
      const next = { ...prev, [id]: true };
      writeSidebarSectionExpansionState(next);
      return next;
    });
  }, []);

  return useMemo(
    () => ({
      hydrated,
      state,
      storageKey: SIDEBAR_SECTION_EXPANSION_STORAGE_KEY,
      isExpanded,
      setExpanded,
      toggleExpanded,
      ensureExpanded,
    }),
    [
      hydrated,
      state,
      isExpanded,
      setExpanded,
      toggleExpanded,
      ensureExpanded,
    ],
  );
}
