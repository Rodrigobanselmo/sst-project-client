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
  COMPANY_WORKSPACE_CARDS_COLLAPSED_DEFAULT,
  COMPANY_WORKSPACE_CARDS_COLLAPSED_STORAGE_KEY,
  getCompanyWorkspaceCardsToggleLabel,
  parseCompanyWorkspaceCardsCollapsed,
  readCompanyWorkspaceCardsCollapsed,
  writeCompanyWorkspaceCardsCollapsed,
} from './useCompanyWorkspaceCardsCollapsed.util';

export {
  COMPANY_WORKSPACE_CARDS_COLLAPSED_DEFAULT,
  COMPANY_WORKSPACE_CARDS_COLLAPSED_STORAGE_KEY,
  getCompanyWorkspaceCardsToggleLabel,
  parseCompanyWorkspaceCardsCollapsed,
  readCompanyWorkspaceCardsCollapsed,
  writeCompanyWorkspaceCardsCollapsed,
} from './useCompanyWorkspaceCardsCollapsed.util';

type CompanyWorkspaceCardsCollapsedContextValue = {
  /** true = cards ocultos */
  collapsed: boolean;
  hydrated: boolean;
  setCollapsed: (next: boolean) => void;
  toggleCollapsed: () => void;
  toggleLabel: string;
  storageKey: string;
};

const CompanyWorkspaceCardsCollapsedContext =
  createContext<CompanyWorkspaceCardsCollapsedContextValue | null>(null);

function useCompanyWorkspaceCardsCollapsedState(): CompanyWorkspaceCardsCollapsedContextValue {
  const [collapsed, setCollapsedState] = useState(
    COMPANY_WORKSPACE_CARDS_COLLAPSED_DEFAULT,
  );
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setCollapsedState(readCompanyWorkspaceCardsCollapsed());
    setHydrated(true);
  }, []);

  const setCollapsed = useCallback((next: boolean) => {
    setCollapsedState(next);
    writeCompanyWorkspaceCardsCollapsed(next);
  }, []);

  const toggleCollapsed = useCallback(() => {
    setCollapsedState((prev) => {
      const next = !prev;
      writeCompanyWorkspaceCardsCollapsed(next);
      return next;
    });
  }, []);

  return useMemo(
    () => ({
      collapsed,
      hydrated,
      setCollapsed,
      toggleCollapsed,
      toggleLabel: getCompanyWorkspaceCardsToggleLabel(collapsed),
      storageKey: COMPANY_WORKSPACE_CARDS_COLLAPSED_STORAGE_KEY,
    }),
    [collapsed, hydrated, setCollapsed, toggleCollapsed],
  );
}

/**
 * Uma única fonte reativa de verdade dos cards do workspace.
 * Persistência em localStorage é consequência do setState.
 */
export function CompanyWorkspaceCardsProvider({
  children,
}: {
  children: ReactNode;
}) {
  const value = useCompanyWorkspaceCardsCollapsedState();
  return (
    <CompanyWorkspaceCardsCollapsedContext.Provider value={value}>
      {children}
    </CompanyWorkspaceCardsCollapsedContext.Provider>
  );
}

export function useCompanyWorkspaceCardsCollapsed(): CompanyWorkspaceCardsCollapsedContextValue {
  const ctx = useContext(CompanyWorkspaceCardsCollapsedContext);
  if (!ctx) {
    throw new Error(
      'useCompanyWorkspaceCardsCollapsed must be used within CompanyWorkspaceCardsProvider',
    );
  }
  return ctx;
}

/** @deprecated Prefer CompanyWorkspaceCardsProvider */
export const CharacterizationSummaryCollapsedProvider =
  CompanyWorkspaceCardsProvider;

/** @deprecated Prefer useCompanyWorkspaceCardsCollapsed */
export const useCharacterizationSummaryCollapsed =
  useCompanyWorkspaceCardsCollapsed;

/** @deprecated */
export const CompanySummaryCardsCollapsedProvider =
  CompanyWorkspaceCardsProvider;

/** @deprecated */
export const useCompanySummaryCardsCollapsed =
  useCompanyWorkspaceCardsCollapsed;
