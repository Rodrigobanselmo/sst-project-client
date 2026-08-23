import React, { useEffect, useMemo } from 'react';

import { Box } from '@mui/material';
import {
  selectAllDocumentModel,
  selectDocumentSelectItem,
} from 'store/reducers/document/documentSlice';
import { HeadingNumberingMap } from 'components/organisms/documentModel/utils/buildDocumentHeadingNumbering';
import { IDocumentModelFull } from 'core/interfaces/api/IDocumentModel';
import { useAppSelector } from 'core/hooks/useAppSelector';

import { DocumentEditorV2SectionView } from './DocumentEditorV2SectionView';
import { useDocumentEditorV2Session } from './DocumentEditorV2Session';
import { projectSelectedContentToDocumentData } from './document-editor-v2-projection';
import {
  isEditorSwitchVisible,
  resolvePinnedSelection,
} from './document-editor-v2-session';

export function DocumentModelEditorBoundary({
  v1,
  model,
  headingNumbering,
}: {
  v1: React.ReactNode;
  model: IDocumentModelFull | undefined;
  headingNumbering: HeadingNumberingMap;
}) {
  const selectedItem = useAppSelector(selectDocumentSelectItem);
  const documentModel = useAppSelector(selectAllDocumentModel);
  const session = useDocumentEditorV2Session();

  const {
    flagEnabled,
    visibleSurface,
    v2LocalDirty,
    pinSelectedItem,
    remountKey,
    syncBaseline,
  } = session;

  useEffect(() => {
    if (!flagEnabled || visibleSurface !== 'v2') return;
    if (v2LocalDirty) return;
    pinSelectedItem(selectedItem);
  }, [
    flagEnabled,
    pinSelectedItem,
    selectedItem,
    v2LocalDirty,
    visibleSurface,
  ]);

  const pinned = resolvePinnedSelection({
    selectedItem,
    pinnedItem: session.pinnedSelectedItem,
    v2LocalDirty,
    surface: visibleSurface,
  });

  const projected = useMemo(
    () =>
      projectSelectedContentToDocumentData(
        documentModel,
        model?.sections,
        pinned.renderItem,
      ),
    [documentModel, model?.sections, pinned.renderItem],
  );

  useEffect(() => {
    if (!flagEnabled || visibleSurface !== 'v2') return;
    syncBaseline(projected);
  }, [flagEnabled, projected, syncBaseline, visibleSurface]);

  if (!isEditorSwitchVisible(flagEnabled)) {
    return <>{v1}</>;
  }

  return (
    <Box>
      {visibleSurface === 'v2' ? (
        <DocumentEditorV2SectionView
          key={`${pinned.renderItem?.id || 'empty'}-${remountKey}`}
          documentData={projected}
          headingNumbering={headingNumbering}
          elements={model?.elements}
        />
      ) : (
        v1
      )}
    </Box>
  );
}
