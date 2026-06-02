import { useCallback, useEffect, useState } from 'react';

import { Box } from '@mui/material';
import { CharacterizationEditView } from '@v2/pages/companies/characterization-edit/CharacterizationEditView';
import { CharacterizationBrowseResultModel } from '@v2/models/security/models/characterization/characterization-browse-result.model';
import { useRouter } from 'next/router';

import { useCharacterizationInlineEditor } from 'pages/dashboard/empresas/[companyId]/novo/[stage]/context/CharacterizationInlineEditorContext';

import { CharacterizationTable } from '../CharacterizationTable/CharacterizationTable';

type CharacterizationEnvironmentsTabContentProps = {
  companyFlowSticky?: boolean;
  companyFlowBelowTabs?: boolean;
};

type EditSession = {
  id: string;
  workspaceId: string;
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
  const { setInlineEditOpen } = useCharacterizationInlineEditor();

  useEffect(() => {
    setInlineEditOpen(!!editSession);
    return () => setInlineEditOpen(false);
  }, [editSession, setInlineEditOpen]);

  const openEditor = useCallback(
    (id: string, workspaceId: string) => {
      if (!companyId || !workspaceId) return;
      setEditSession({ id, workspaceId });
    },
    [companyId],
  );

  const handleInlineEdit = useCallback(
    (row: CharacterizationBrowseResultModel) => {
      if (!companyId || !tabWorkspaceId) return;
      openEditor(row.id, tabWorkspaceId);
    },
    [companyId, openEditor, tabWorkspaceId],
  );

  const handleInlineAdd = useCallback(() => {
    if (!companyId || !tabWorkspaceId) return;
    openEditor('new', tabWorkspaceId);
  }, [companyId, openEditor, tabWorkspaceId]);

  if (editSession && companyId) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          minHeight: 0,
          width: '100%',
        }}
      >
        <CharacterizationEditView
          key={editSession.id}
          companyId={companyId}
          workspaceId={editSession.workspaceId}
          characterizationId={editSession.id}
          embedded
          onBack={() => setEditSession(null)}
        />
      </Box>
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
