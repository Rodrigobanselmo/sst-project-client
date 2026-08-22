import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

import { featureFlags } from '@v2/constants/feature-flags';
import { NodeDocumentModel } from 'components/organisms/documentModel/DocumentModelTree/types/types';

import { DocumentEditorV2HostProvider } from './DocumentEditorV2Host';
import {
  DOCUMENT_EDITOR_V2_BLOCK_SAVE_REASON,
  DOCUMENT_EDITOR_V2_BLOCK_SWITCH_REASON,
} from './document-editor-v2-notices';
import {
  DocumentEditorSurface,
  requestSurfaceChange,
  resolvePinnedSelection,
  resolveVisibleSurface,
  shouldBlockOfficialSave as resolveShouldBlockOfficialSave,
} from './document-editor-v2-session';

export type DocumentEditorV2SessionValue = {
  flagEnabled: boolean;
  surface: DocumentEditorSurface;
  visibleSurface: DocumentEditorSurface;
  v2LocalDirty: boolean;
  remountKey: number;
  pinnedSelectedItem: NodeDocumentModel | null;
  experimentNotice: string | null;
  requestSurface: (next: DocumentEditorSurface) => boolean;
  markLocalDirty: () => void;
  discardLocalEdits: () => void;
  pinSelectedItem: (item: NodeDocumentModel | null) => void;
  resolveRenderItem: (
    selectedItem: NodeDocumentModel | null,
  ) => NodeDocumentModel | null;
  shouldBlockOfficialSave: boolean;
  reportBlockedSave: () => void;
  clearNotice: () => void;
};

const defaultSession: DocumentEditorV2SessionValue = {
  flagEnabled: featureFlags.documentEditorV2,
  surface: 'v1',
  visibleSurface: 'v1',
  v2LocalDirty: false,
  remountKey: 0,
  pinnedSelectedItem: null,
  experimentNotice: null,
  requestSurface: () => false,
  markLocalDirty: () => undefined,
  discardLocalEdits: () => undefined,
  pinSelectedItem: () => undefined,
  resolveRenderItem: (selectedItem) => selectedItem,
  shouldBlockOfficialSave: false,
  reportBlockedSave: () => undefined,
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
  const flagEnabled = featureFlags.documentEditorV2;
  const [surface, setSurface] = useState<DocumentEditorSurface>('v1');
  const [v2LocalDirty, setV2LocalDirty] = useState(false);
  const [remountKey, setRemountKey] = useState(0);
  const [pinnedSelectedItem, setPinnedSelectedItem] =
    useState<NodeDocumentModel | null>(null);
  const [experimentNotice, setExperimentNotice] = useState<string | null>(null);

  const visibleSurface = resolveVisibleSurface({ flagEnabled, surface });

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

  const shouldBlockOfficialSave = resolveShouldBlockOfficialSave({
    surface: visibleSurface,
    v2LocalDirty,
  });

  const reportBlockedSave = useCallback(() => {
    setExperimentNotice(DOCUMENT_EDITOR_V2_BLOCK_SAVE_REASON);
  }, []);

  const clearNotice = useCallback(() => {
    setExperimentNotice(null);
  }, []);

  const value = useMemo<DocumentEditorV2SessionValue>(
    () => ({
      flagEnabled,
      surface,
      visibleSurface,
      v2LocalDirty,
      remountKey,
      pinnedSelectedItem,
      experimentNotice,
      requestSurface,
      markLocalDirty,
      discardLocalEdits,
      pinSelectedItem,
      resolveRenderItem,
      shouldBlockOfficialSave,
      reportBlockedSave,
      clearNotice,
    }),
    [
      flagEnabled,
      surface,
      visibleSurface,
      v2LocalDirty,
      remountKey,
      pinnedSelectedItem,
      experimentNotice,
      requestSurface,
      markLocalDirty,
      discardLocalEdits,
      pinSelectedItem,
      resolveRenderItem,
      shouldBlockOfficialSave,
      reportBlockedSave,
      clearNotice,
    ],
  );

  return (
    <DocumentEditorV2SessionContext.Provider value={value}>
      <DocumentEditorV2HostProvider>{children}</DocumentEditorV2HostProvider>
    </DocumentEditorV2SessionContext.Provider>
  );
}
