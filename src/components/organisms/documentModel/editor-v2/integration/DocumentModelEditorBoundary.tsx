import React, { useEffect, useMemo } from 'react';

import {
  Alert,
  Box,
  Button,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import {
  selectAllDocumentModel,
  selectDocumentSelectItem,
} from 'store/reducers/document/documentSlice';
import { HeadingNumberingMap } from 'components/organisms/documentModel/utils/buildDocumentHeadingNumbering';
import { IDocumentModelFull } from 'core/interfaces/api/IDocumentModel';
import { useAppSelector } from 'core/hooks/useAppSelector';

import { DocumentEditorV2SectionView } from './DocumentEditorV2SectionView';
import { useDocumentEditorV2Session } from './DocumentEditorV2Session';
import { DOCUMENT_EDITOR_V2_BLOCK_SECTION_REASON } from './document-editor-v2-notices';
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
    experimentNotice,
    requestSurface,
    discardLocalEdits,
    pinSelectedItem,
    remountKey,
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

  if (!isEditorSwitchVisible(flagEnabled)) {
    return <>{v1}</>;
  }

  return (
    <Box>
      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
        justifyContent="space-between"
        sx={{ px: 2, pb: 1 }}
      >
        <Typography
          variant="caption"
          sx={{ fontWeight: 700, color: 'warning.main' }}
        >
          Editor V2 — Experimental
        </Typography>
        <ToggleButtonGroup
          exclusive
          size="small"
          value={visibleSurface}
          onChange={(_event, value: 'v1' | 'v2' | null) => {
            if (!value) return;
            requestSurface(value);
          }}
        >
          <ToggleButton value="v1">Clássico</ToggleButton>
          <ToggleButton value="v2">V2 experimental</ToggleButton>
        </ToggleButtonGroup>
      </Stack>

      {(experimentNotice || pinned.blockedSectionSwitch) && (
        <Alert
          severity="warning"
          sx={{ mx: 2, mb: 1 }}
          action={
            v2LocalDirty ? (
              <Button color="inherit" size="small" onClick={discardLocalEdits}>
                Descartar experimento
              </Button>
            ) : undefined
          }
        >
          {experimentNotice || DOCUMENT_EDITOR_V2_BLOCK_SECTION_REASON}
        </Alert>
      )}

      {v2LocalDirty && !experimentNotice && !pinned.blockedSectionSwitch && (
        <Alert severity="info" sx={{ mx: 2, mb: 1 }}>
          Alterações locais do V2 — não salvas no modelo e sem dirty oficial.
        </Alert>
      )}

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
