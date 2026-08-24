import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

import { featureFlags } from '@v2/constants/feature-flags';
import { NodeDocumentModel } from 'components/organisms/documentModel/DocumentModelTree/types/types';
import { IDocumentModelData } from 'core/interfaces/api/IDocumentModel';

import {
  buildDocumentEditorCandidate,
  DocumentEditorCandidate,
} from '../domain/build-document-editor-candidate';
import { useDocumentEditorV2Access } from './document-editor-v2-access';
import {
  DocumentEditorV2HostProvider,
  useDocumentEditorV2Host,
} from './DocumentEditorV2Host';
import {
  planDocumentEditorV2Persist,
  V2PersistPlan,
} from './document-editor-v2-controlled-save';
import {
  DOCUMENT_EDITOR_V2_BLOCK_SAVE_REASON,
  DOCUMENT_EDITOR_V2_BLOCK_SWITCH_REASON,
} from './document-editor-v2-notices';
import { toDocumentEditorSelection } from './document-editor-v2-selection';
import {
  DocumentEditorV2ViewMode,
  resolveDocumentEditorV2ViewMode,
} from './document-editor-v2-page-layout';
import {
  DocumentEditorSurface,
  requestSurfaceChange,
  resolvePinnedSelection,
  resolveVisibleSurface,
  shouldBlockOfficialSave as resolveShouldBlockOfficialSave,
} from './document-editor-v2-session';

export type DocumentEditorV2SessionValue = {
  flagEnabled: boolean;
  saveEnabled: boolean;
  isV2Active: boolean;
  canPersistV2: boolean;
  surface: DocumentEditorSurface;
  visibleSurface: DocumentEditorSurface;
  v2LocalDirty: boolean;
  contentSavePending: boolean;
  remountKey: number;
  pinnedSelectedItem: NodeDocumentModel | null;
  baselineProjection: IDocumentModelData | null;
  experimentNotice: string | null;
  viewMode: DocumentEditorV2ViewMode;
  requestSurface: (next: DocumentEditorSurface) => boolean;
  requestViewMode: (next: DocumentEditorV2ViewMode) => boolean;
  setContentSavePending: (pending: boolean) => void;
  markLocalDirty: () => void;
  discardLocalEdits: () => void;
  discardExperiment: () => void;
  pinSelectedItem: (item: NodeDocumentModel | null) => void;
  resolveRenderItem: (
    selectedItem: NodeDocumentModel | null,
  ) => NodeDocumentModel | null;
  syncBaseline: (projection: IDocumentModelData | null) => void;
  buildCandidate: (originalModel: IDocumentModelData) => DocumentEditorCandidate;
  planPersist: (originalModel: IDocumentModelData) => V2PersistPlan;
  markPersisted: (built: DocumentEditorCandidate) => void;
  shouldBlockOfficialSave: boolean;
  reportBlockedSave: () => void;
  reportPersistError: (message: string) => void;
  clearNotice: () => void;
};

const defaultSession: DocumentEditorV2SessionValue = {
  flagEnabled: featureFlags.documentEditorV2,
  saveEnabled: featureFlags.documentEditorV2Save,
  isV2Active: false,
  canPersistV2: false,
  surface: 'v1',
  visibleSurface: 'v1',
  v2LocalDirty: false,
  contentSavePending: false,
  remountKey: 0,
  pinnedSelectedItem: null,
  baselineProjection: null,
  experimentNotice: null,
  viewMode: 'web',
  requestSurface: () => false,
  requestViewMode: () => false,
  setContentSavePending: () => undefined,
  markLocalDirty: () => undefined,
  discardLocalEdits: () => undefined,
  discardExperiment: () => undefined,
  pinSelectedItem: () => undefined,
  resolveRenderItem: (selectedItem) => selectedItem,
  syncBaseline: () => undefined,
  buildCandidate: () => {
    throw new Error('DocumentEditorV2Session indisponível.');
  },
  planPersist: () => ({ type: 'v1-redux' }),
  markPersisted: () => undefined,
  shouldBlockOfficialSave: false,
  reportBlockedSave: () => undefined,
  reportPersistError: () => undefined,
  clearNotice: () => undefined,
};

const DocumentEditorV2SessionContext =
  createContext<DocumentEditorV2SessionValue>(defaultSession);

export function useDocumentEditorV2Session(): DocumentEditorV2SessionValue {
  return useContext(DocumentEditorV2SessionContext);
}

export function DocumentEditorV2SessionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DocumentEditorV2HostProvider>
      <DocumentEditorV2SessionInner>{children}</DocumentEditorV2SessionInner>
    </DocumentEditorV2HostProvider>
  );
}

function DocumentEditorV2SessionInner({
  children,
}: {
  children: React.ReactNode;
}) {
  const host = useDocumentEditorV2Host();
  const { canUseV2, canPersistV2: persistAccess } = useDocumentEditorV2Access();
  const flagEnabled = canUseV2;
  const saveEnabled = persistAccess;
  const [surface, setSurface] = useState<DocumentEditorSurface>('v1');
  const [viewMode, setViewMode] = useState<DocumentEditorV2ViewMode>('web');
  const [v2LocalDirty, setV2LocalDirty] = useState(false);
  const [contentSavePending, setContentSavePending] = useState(false);
  const [remountKey, setRemountKey] = useState(0);
  const [pinnedSelectedItem, setPinnedSelectedItem] =
    useState<NodeDocumentModel | null>(null);
  const [baselineProjection, setBaselineProjection] =
    useState<IDocumentModelData | null>(null);
  const [experimentNotice, setExperimentNotice] = useState<string | null>(null);

  const visibleSurface = resolveVisibleSurface({ flagEnabled, surface });
  const isV2Active = flagEnabled && visibleSurface === 'v2';
  const canPersistV2 = isV2Active && saveEnabled;

  const requestSurface = useCallback(
    (next: DocumentEditorSurface) => {
      if (!flagEnabled) return false;
      const result = requestSurfaceChange({
        current: surface,
        next,
        v2LocalDirty,
      });
      if (!result.allowed) {
        setExperimentNotice(
          result.reason || DOCUMENT_EDITOR_V2_BLOCK_SWITCH_REASON,
        );
        return false;
      }
      setSurface(next);
      setExperimentNotice(null);
      return true;
    },
    [flagEnabled, surface, v2LocalDirty],
  );

  const requestViewMode = useCallback((next: DocumentEditorV2ViewMode) => {
    const mode = resolveDocumentEditorV2ViewMode(next);
    setViewMode(mode);
    return true;
  }, []);

  const markLocalDirty = useCallback(() => {
    if (!flagEnabled || visibleSurface !== 'v2') return;
    setV2LocalDirty(true);
  }, [flagEnabled, visibleSurface]);

  const discardLocalEdits = useCallback(() => {
    setV2LocalDirty(false);
    setExperimentNotice(null);
    setRemountKey((key) => key + 1);
  }, []);

  const pinSelectedItem = useCallback(
    (item: NodeDocumentModel | null) => {
      if (v2LocalDirty) return;
      setPinnedSelectedItem(item);
    },
    [v2LocalDirty],
  );

  const resolveRenderItem = useCallback(
    (selectedItem: NodeDocumentModel | null) => {
      return resolvePinnedSelection({
        selectedItem,
        pinnedItem: pinnedSelectedItem,
        v2LocalDirty,
        surface: visibleSurface,
      }).renderItem;
    },
    [pinnedSelectedItem, v2LocalDirty, visibleSurface],
  );

  const syncBaseline = useCallback(
    (projection: IDocumentModelData | null) => {
      if (v2LocalDirty) return;
      setBaselineProjection(projection);
    },
    [v2LocalDirty],
  );

  const buildCandidate = useCallback(
    (originalModel: IDocumentModelData) => {
      const selected = toDocumentEditorSelection(pinnedSelectedItem);
      if (!selected) {
        throw new Error(DOCUMENT_EDITOR_V2_BLOCK_SAVE_REASON);
      }
      return buildDocumentEditorCandidate({
        originalModel,
        selectedItem: selected,
        baselineProjection: baselineProjection || undefined,
        tipTapDoc: host.editor?.getJSON(),
      });
    },
    [baselineProjection, host.editor, pinnedSelectedItem],
  );

  const planPersist = useCallback(
    (originalModel: IDocumentModelData) => {
      return planDocumentEditorV2Persist({
        surface: visibleSurface,
        saveEnabled: canPersistV2,
        v2LocalDirty,
        originalModel,
        selectedItem: toDocumentEditorSelection(pinnedSelectedItem),
        baselineProjection,
        tipTapDoc: host.editor?.getJSON() ?? null,
      });
    },
    [
      baselineProjection,
      canPersistV2,
      host.editor,
      pinnedSelectedItem,
      v2LocalDirty,
      visibleSurface,
    ],
  );

  const markPersisted = useCallback((built: DocumentEditorCandidate) => {
    setV2LocalDirty(false);
    setExperimentNotice(null);
    setBaselineProjection(built.editedProjected);
  }, []);

  const shouldBlockOfficialSave = resolveShouldBlockOfficialSave({
    surface: visibleSurface,
    v2LocalDirty,
    saveEnabled: canPersistV2,
  });

  const reportBlockedSave = useCallback(() => {
    setExperimentNotice(DOCUMENT_EDITOR_V2_BLOCK_SAVE_REASON);
  }, []);

  const reportPersistError = useCallback((message: string) => {
    setExperimentNotice(message);
  }, []);

  const clearNotice = useCallback(() => {
    setExperimentNotice(null);
  }, []);

  const value = useMemo<DocumentEditorV2SessionValue>(
    () => ({
      flagEnabled,
      saveEnabled,
      isV2Active,
      canPersistV2,
      surface,
      visibleSurface,
      v2LocalDirty,
      contentSavePending,
      remountKey,
      pinnedSelectedItem,
      baselineProjection,
      experimentNotice,
      viewMode,
      requestSurface,
      requestViewMode,
      setContentSavePending,
      markLocalDirty,
      discardLocalEdits,
      discardExperiment: discardLocalEdits,
      pinSelectedItem,
      resolveRenderItem,
      syncBaseline,
      buildCandidate,
      planPersist,
      markPersisted,
      shouldBlockOfficialSave,
      reportBlockedSave,
      reportPersistError,
      clearNotice,
    }),
    [
      baselineProjection,
      buildCandidate,
      canPersistV2,
      contentSavePending,
      discardLocalEdits,
      experimentNotice,
      flagEnabled,
      isV2Active,
      markLocalDirty,
      markPersisted,
      setContentSavePending,
      pinSelectedItem,
      pinnedSelectedItem,
      planPersist,
      remountKey,
      reportBlockedSave,
      reportPersistError,
      requestSurface,
      requestViewMode,
      resolveRenderItem,
      saveEnabled,
      shouldBlockOfficialSave,
      surface,
      syncBaseline,
      viewMode,
      v2LocalDirty,
      visibleSurface,
    ],
  );

  return (
    <DocumentEditorV2SessionContext.Provider value={value}>
      {children}
    </DocumentEditorV2SessionContext.Provider>
  );
}
