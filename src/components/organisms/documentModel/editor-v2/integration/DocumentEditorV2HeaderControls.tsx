import React from 'react';

import {
  Button,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import { selectDocumentSelectItem } from 'store/reducers/document/documentSlice';

import { useAppSelector } from 'core/hooks/useAppSelector';

import { documentModelEditorToggleGroupSx } from 'components/organisms/tables/DocumentModelTable/document-model-presentation-theme';

import { DocumentEditorV2Toolbar } from './DocumentEditorV2Toolbar';
import { useDocumentEditorV2Host } from './DocumentEditorV2Host';
import { useDocumentEditorV2Session } from './DocumentEditorV2Session';
import { DOCUMENT_EDITOR_V2_BLOCK_SECTION_REASON } from './document-editor-v2-notices';
import { resolveExperimentalStatusMessage } from './document-editor-v2-save-guard';
import {
  isEditorSwitchVisible,
  resolvePinnedSelection,
} from './document-editor-v2-session';

export function DocumentEditorV2HeaderControls() {
  const selectedItem = useAppSelector(selectDocumentSelectItem);
  const session = useDocumentEditorV2Session();
  const { editor, revision } = useDocumentEditorV2Host();

  if (!isEditorSwitchVisible(session.flagEnabled)) return null;

  const pinned = resolvePinnedSelection({
    selectedItem,
    pinnedItem: session.pinnedSelectedItem,
    v2LocalDirty: session.v2LocalDirty,
    surface: session.visibleSurface,
  });

  const statusMessage = resolveExperimentalStatusMessage({
    v2LocalDirty: session.v2LocalDirty,
    experimentNotice: session.experimentNotice,
    blockedSectionSwitch: pinned.blockedSectionSwitch,
    sectionReason: DOCUMENT_EDITOR_V2_BLOCK_SECTION_REASON,
  });

  return (
    <Stack spacing={0.5} sx={{ minWidth: 0, flex: 1 }}>
      <Stack
        direction="row"
        spacing={1}
        useFlexGap
        flexWrap="wrap"
        alignItems="center"
      >
        <ToggleButtonGroup
          exclusive
          size="small"
          value={session.visibleSurface}
          onChange={(_event, value: 'v1' | 'v2' | null) => {
            if (!value) return;
            session.requestSurface(value);
          }}
          sx={documentModelEditorToggleGroupSx}
        >
          <ToggleButton value="v1">Clássico</ToggleButton>
          <ToggleButton value="v2">V2 experimental</ToggleButton>
        </ToggleButtonGroup>
        {session.visibleSurface === 'v2' ? (
          <ToggleButtonGroup
            exclusive
            size="small"
            value={session.viewMode}
            onChange={(_event, value: 'web' | 'page' | null) => {
              if (!value) return;
              session.requestViewMode(value);
            }}
            sx={documentModelEditorToggleGroupSx}
          >
            <ToggleButton value="web">Web</ToggleButton>
            <ToggleButton value="page">Página</ToggleButton>
          </ToggleButtonGroup>
        ) : null}
        {session.visibleSurface === 'v2' ? (
          <DocumentEditorV2Toolbar key={revision} editor={editor} />
        ) : null}
      </Stack>
      {statusMessage ? (
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {statusMessage}
          </Typography>
          {session.v2LocalDirty ? (
            <Button
              color="warning"
              size="small"
              onClick={session.discardLocalEdits}
            >
              Descartar experimento
            </Button>
          ) : null}
        </Stack>
      ) : null}
    </Stack>
  );
}
