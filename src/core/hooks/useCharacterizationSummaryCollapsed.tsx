import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import {
  CHARACTERIZATION_SUMMARY_COLLAPSED_DEFAULT,
  CHARACTERIZATION_SUMMARY_COLLAPSED_STORAGE_KEY,
  getCharacterizationSummaryToggleLabel,
  parseCharacterizationSummaryCollapsed,
  readCharacterizationSummaryCollapsed,
  writeCharacterizationSummaryCollapsed,
} from './useCharacterizationSummaryCollapsed.util';

export {
  CHARACTERIZATION_SUMMARY_COLLAPSED_DEFAULT,
  CHARACTERIZATION_SUMMARY_COLLAPSED_STORAGE_KEY,
  getCharacterizationSummaryToggleLabel,
  parseCharacterizationSummaryCollapsed,
  readCharacterizationSummaryCollapsed,
  writeCharacterizationSummaryCollapsed,
};

type CharacterizationSummaryCollapsedContextValue = {
  /** true = cards ocultos */
  collapsed: boolean;
  hydrated: boolean;
  setCollapsed: (next: boolean) => void;
  toggleCollapsed: () => void;
  toggleLabel: string;
  storageKey: string;
};

const CharacterizationSummaryCollapsedContext =
  createContext<CharacterizationSummaryCollapsedContextValue | null>(null);

function useCharacterizationSummaryCollapsedState(): CharacterizationSummaryCollapsedContextValue {
  const [collapsed, setCollapsedState] = useState(
    CHARACTERIZATION_SUMMARY_COLLAPSED_DEFAULT,
  );
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setCollapsedState(readCharacterizationSummaryCollapsed());
    setHydrated(true);
  }, []);

  const setCollapsed = useCallback((next: boolean) => {
    setCollapsedState(next);
    writeCharacterizationSummaryCollapsed(next);
  }, []);

  const toggleCollapsed = useCallback(() => {
    setCollapsedState((prev) => {
      const next = !prev;
      writeCharacterizationSummaryCollapsed(next);
      return next;
    });
  }, []);

  return useMemo(
    () => ({
      collapsed,
      hydrated,
      setCollapsed,
      toggleCollapsed,
      toggleLabel: getCharacterizationSummaryToggleLabel(collapsed),
      storageKey: CHARACTERIZATION_SUMMARY_COLLAPSED_STORAGE_KEY,
    }),
    [collapsed, hydrated, setCollapsed, toggleCollapsed],
  );
}

/**
 * Uma única fonte reativa de verdade por árvore.
 * Persistência em localStorage é consequência do setState, não substitui o estado.
 */
export function CharacterizationSummaryCollapsedProvider({
  children,
}: {
  children: ReactNode;
}) {
  const value = useCharacterizationSummaryCollapsedState();
  return (
    <CharacterizationSummaryCollapsedContext.Provider value={value}>
      {children}
    </CharacterizationSummaryCollapsedContext.Provider>
  );
}

/**
 * Preferência compartilhada dos cards da Caracterização.
 * Deve ser usado dentro de CharacterizationSummaryCollapsedProvider.
 */
export function useCharacterizationSummaryCollapsed(): CharacterizationSummaryCollapsedContextValue {
  const ctx = useContext(CharacterizationSummaryCollapsedContext);
  if (!ctx) {
    throw new Error(
      'useCharacterizationSummaryCollapsed must be used within CharacterizationSummaryCollapsedProvider',
    );
  }
  return ctx;
}
