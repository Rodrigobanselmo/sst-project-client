import { useCallback, useEffect, useState } from 'react';

import { Box, CircularProgress } from '@mui/material';
import { CharacterizationEditView } from '@v2/pages/companies/characterization-edit/CharacterizationEditView';
import { CharacterizationBrowseResultModel } from '@v2/models/security/models/characterization/characterization-browse-result.model';
import { useRouter } from 'next/router';
import SText from 'components/atoms/SText';
import SFlex from 'components/atoms/SFlex';

import { useCharacterizationInlineEditor } from 'pages/dashboard/empresas/[companyId]/novo/[stage]/context/CharacterizationInlineEditorContext';

import { invalidateCharacterizationInventory } from '../CharacterizationTable/quick-actions/invalidate-characterization-inventory';
import type { CharacterizationInitialAiAction } from '../CharacterizationTable/quick-actions/technical-content.util';
import { CharacterizationTable } from '../CharacterizationTable/CharacterizationTable';

type CharacterizationEnvironmentsTabContentProps = {
  companyFlowSticky?: boolean;
  companyFlowBelowTabs?: boolean;
};

type EditSession = {
  id: string;
  workspaceId: string;
  wizardStep?: number;
  initialAiAction?: CharacterizationInitialAiAction;
};

export const CharacterizationEnvironmentsTabContent = ({
  companyFlowSticky = false,
  companyFlowBelowTabs = false,
}: CharacterizationEnvironmentsTabContentProps) => {
  const router = useRouter();
  const companyId = router.query.companyId as string;
  const tabWorkspaceId =
    (router.query.tabWorkspaceId as string | undefined) ||
    (router.query.workspaceId as string | undefined);

  const [editSession, setEditSession] = useState<EditSession | null>(null);
  const [editorRemountKey, setEditorRemountKey] = useState(0);
  const { setInlineEditOpen } = useCharacterizationInlineEditor();

  useEffect(() => {
    setInlineEditOpen(!!editSession);
    return () => setInlineEditOpen(false);
  }, [editSession, setInlineEditOpen]);

  useEffect(() => {
    if (!editSession) return;
    if (companyId && editSession.workspaceId) return;
    setEditSession(null);
  }, [companyId, editSession]);

  const openEditor = useCallback(
    (
      id: string,
      workspaceId: string,
      wizardStep?: number,
      initialAiAction?: CharacterizationInitialAiAction,
    ) => {
      if (!companyId || !workspaceId || !id) return;
      setEditSession({ id, workspaceId, wizardStep, initialAiAction });
    },
    [companyId],
  );

  const handleInlineEdit = useCallback(
    (
      row: CharacterizationBrowseResultModel,
      options?: {
        wizardStep?: number;
        initialAiAction?: CharacterizationInitialAiAction;
      },
    ) => {
      if (!companyId || !tabWorkspaceId || !row?.id) return;
      openEditor(
        row.id,
        tabWorkspaceId,
        options?.wizardStep,
        options?.initialAiAction,
      );
    },
    [companyId, openEditor, tabWorkspaceId],
  );

  const handleInlineAdd = useCallback(() => {
    if (!companyId || !tabWorkspaceId) return;
    openEditor('new', tabWorkspaceId);
  }, [companyId, openEditor, tabWorkspaceId]);

  const closeEditor = useCallback(() => {
    if (companyId && editSession?.workspaceId) {
      void invalidateCharacterizationInventory({
        companyId,
        workspaceId: editSession.workspaceId,
        characterizationId:
          editSession.id && editSession.id !== 'new'
            ? editSession.id
            : undefined,
      });
    }
    setEditSession(null);
  }, [companyId, editSession]);

  if (editSession && companyId && editSession.workspaceId) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          minHeight: 280,
          width: '100%',
          bgcolor: 'background.paper',
        }}
      >
        <CharacterizationEditView
          key={`${editSession.workspaceId}::${editSession.id}::${editSession.wizardStep ?? 'default'}::${editSession.initialAiAction ?? 'none'}::${editorRemountKey}`}
          companyId={companyId}
          workspaceId={editSession.workspaceId}
          characterizationId={editSession.id}
          embedded
          initialWizardStep={editSession.wizardStep}
          initialAiAction={editSession.initialAiAction}
          onBack={closeEditor}
          onRetry={() => setEditorRemountKey((value) => value + 1)}
        />
      </Box>
    );
  }

  if (editSession && (!companyId || !editSession.workspaceId)) {
    return (
      <SFlex
        align="center"
        justify="center"
        direction="column"
        gap={2}
        sx={{ minHeight: 280, width: '100%', py: 8 }}
      >
        <CircularProgress size={32} />
        <SText color="text.secondary" fontSize={13}>
          Preparando edição…
        </SText>
      </SFlex>
    );
  }

  return (
    <CharacterizationTable
      companyFlowSticky={companyFlowSticky}
      companyFlowBelowTabs={companyFlowBelowTabs}
      onInlineEdit={handleInlineEdit}
      onInlineAdd={handleInlineAdd}
    />
  );
};
