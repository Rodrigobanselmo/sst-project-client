import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

type RiskToolWideViewContextValue = {
  wideView: boolean;
  toggleWideView: () => void;
  setWideView: (wide: boolean) => void;
};

const RiskToolWideViewContext =
  createContext<RiskToolWideViewContextValue | null>(null);

/** Modo visual amplo: mesmo tree React (sem remount / sem refetch). */
export function RiskToolWideViewProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [wideView, setWideView] = useState(false);

  const toggleWideView = useCallback(() => {
    setWideView((prev) => !prev);
  }, []);

  const value = useMemo(
    () => ({ wideView, toggleWideView, setWideView }),
    [toggleWideView, wideView],
  );

  return (
    <RiskToolWideViewContext.Provider value={value}>
      {children}
    </RiskToolWideViewContext.Provider>
  );
}

export function useRiskToolWideViewOptional() {
  return useContext(RiskToolWideViewContext);
}
