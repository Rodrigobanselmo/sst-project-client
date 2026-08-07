import React, {
  createContext,
  FC,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { DndContext, DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import {
  RiskCatalogBatchSession,
  RiskCatalogDndDragItem,
  RiskCatalogDndKind,
  RiskCatalogPulseTarget,
} from './risk-catalog-dnd.types';

type RiskCatalogDndContextValue = {
  activeKind: RiskCatalogDndKind | null;
  setActiveKind: (kind: RiskCatalogDndKind | null) => void;
  isDragging: boolean;
  batchSession: RiskCatalogBatchSession | null;
  startBatchCopy: (session: RiskCatalogBatchSession) => void;
  clearBatchCopy: () => void;
  /** Destacar colunas compatíveis (drag ou batch). */
  highlightKind: RiskCatalogDndKind | null;
  isSelectingDestination: boolean;
  /** Feedback visual curto após batch bem-sucedido. */
  pulseTarget: RiskCatalogPulseTarget | null;
  triggerPulse: (target: RiskCatalogPulseTarget) => void;
};

const RiskCatalogDndContext = createContext<RiskCatalogDndContextValue | null>(
  null,
);

export const useRiskCatalogDndOptional = () => useContext(RiskCatalogDndContext);

export const useRiskCatalogDnd = () => {
  const ctx = useRiskCatalogDndOptional();
  if (!ctx) {
    throw new Error('useRiskCatalogDnd must be used within RiskCatalogDndProvider');
  }
  return ctx;
};

/** Evita dois HTML5Backend (erro do react-dnd) quando já há DndProvider no ancestral. */
const EnsureHtml5DndProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const existing = useContext(DndContext);
  if (existing?.dragDropManager) {
    return <>{children}</>;
  }
  return <DndProvider backend={HTML5Backend}>{children}</DndProvider>;
};

export const RiskCatalogDndProvider: FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [activeKind, setActiveKindState] = useState<RiskCatalogDndKind | null>(
    null,
  );
  const [batchSession, setBatchSession] =
    useState<RiskCatalogBatchSession | null>(null);
  const [pulseTarget, setPulseTarget] = useState<RiskCatalogPulseTarget | null>(
    null,
  );
  const pulseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setActiveKind = useCallback((kind: RiskCatalogDndKind | null) => {
    setActiveKindState(kind);
    if (kind != null) {
      setBatchSession(null);
    }
  }, []);

  const clearBatchCopy = useCallback(() => {
    setBatchSession(null);
  }, []);

  const startBatchCopy = useCallback((session: RiskCatalogBatchSession) => {
    setActiveKindState(null);
    setBatchSession(session);
  }, []);

  const triggerPulse = useCallback((target: RiskCatalogPulseTarget) => {
    if (pulseTimerRef.current) {
      clearTimeout(pulseTimerRef.current);
    }
    setPulseTarget(target);
    pulseTimerRef.current = setTimeout(() => {
      setPulseTarget(null);
      pulseTimerRef.current = null;
    }, 900);
  }, []);

  useEffect(() => {
    if (!batchSession) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setBatchSession(null);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [batchSession]);

  useEffect(() => {
    return () => {
      if (pulseTimerRef.current) clearTimeout(pulseTimerRef.current);
    };
  }, []);

  const highlightKind = activeKind ?? batchSession?.kind ?? null;
  const isSelectingDestination = batchSession != null;

  const value = useMemo(
    () => ({
      activeKind,
      setActiveKind,
      isDragging: activeKind != null,
      batchSession,
      startBatchCopy,
      clearBatchCopy,
      highlightKind,
      isSelectingDestination,
      pulseTarget,
      triggerPulse,
    }),
    [
      activeKind,
      setActiveKind,
      batchSession,
      startBatchCopy,
      clearBatchCopy,
      highlightKind,
      isSelectingDestination,
      pulseTarget,
      triggerPulse,
    ],
  );

  return (
    <EnsureHtml5DndProvider>
      <RiskCatalogDndContext.Provider value={value}>
        {children}
      </RiskCatalogDndContext.Provider>
    </EnsureHtml5DndProvider>
  );
};

export type { RiskCatalogDndDragItem };
