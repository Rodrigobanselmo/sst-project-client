import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

type RiskRowsExpandContextValue = {
  isExpanded: (riskRowId: string) => boolean;
  toggle: (riskRowId: string) => void;
  setKnownRowIds: (riskRowIds: string[]) => void;
  expandAll: () => void;
  collapseAll: () => void;
  allExpanded: boolean;
  allCollapsed: boolean;
  hasRows: boolean;
};

const RiskRowsExpandContext =
  createContext<RiskRowsExpandContextValue | null>(null);

/**
 * Por padrão as linhas ficam expandidas (comportamento legado).
 * `collapsedIds` guarda apenas as que o usuário recolheu.
 */
export function RiskRowsExpandProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [knownRowIds, setKnownRowIdsState] = useState<string[]>([]);

  const setKnownRowIds = useCallback((riskRowIds: string[]) => {
    setKnownRowIdsState((prev) => {
      if (
        prev.length === riskRowIds.length &&
        prev.every((id, index) => id === riskRowIds[index])
      ) {
        return prev;
      }
      return riskRowIds;
    });
  }, []);

  const isExpanded = useCallback(
    (riskRowId: string) => !collapsedIds.has(riskRowId),
    [collapsedIds],
  );

  const toggle = useCallback((riskRowId: string) => {
    setCollapsedIds((prev) => {
      const next = new Set(prev);
      if (next.has(riskRowId)) next.delete(riskRowId);
      else next.add(riskRowId);
      return next;
    });
  }, []);

  const expandAll = useCallback(() => {
    setCollapsedIds(new Set());
  }, []);

  const collapseAll = useCallback(() => {
    setCollapsedIds(new Set(knownRowIds));
  }, [knownRowIds]);

  const allExpanded =
    knownRowIds.length === 0 ||
    knownRowIds.every((id) => !collapsedIds.has(id));

  const allCollapsed =
    knownRowIds.length > 0 &&
    knownRowIds.every((id) => collapsedIds.has(id));

  const value = useMemo(
    () => ({
      isExpanded,
      toggle,
      setKnownRowIds,
      expandAll,
      collapseAll,
      allExpanded,
      allCollapsed,
      hasRows: knownRowIds.length > 0,
    }),
    [
      allCollapsed,
      allExpanded,
      collapseAll,
      expandAll,
      isExpanded,
      knownRowIds.length,
      setKnownRowIds,
      toggle,
    ],
  );

  return (
    <RiskRowsExpandContext.Provider value={value}>
      {children}
    </RiskRowsExpandContext.Provider>
  );
}

export function useRiskRowsExpand() {
  const ctx = useContext(RiskRowsExpandContext);
  if (!ctx) {
    throw new Error(
      'useRiskRowsExpand must be used within RiskRowsExpandProvider',
    );
  }
  return ctx;
}

export function useRiskRowsExpandOptional() {
  return useContext(RiskRowsExpandContext);
}
