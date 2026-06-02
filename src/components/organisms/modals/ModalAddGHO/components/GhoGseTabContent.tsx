import React from 'react';

import { BoxProps } from '@mui/material';
import { GhosTable } from 'components/organisms/tables/GhosTable/GhosTable';
import { IQueryGhos } from 'core/services/hooks/queries/useQueryGhos/useQueryGhos';
import { IGho } from 'core/interfaces/api/IGho';

import { ModalEnum } from 'core/enums/modal.enums';

import { useGhoEditorOptional } from '../context/GhoEditorContext';
import { GhoPageEditor } from './GhoPageEditor';

type GhoGseTabContentProps = BoxProps & {
  workspaceId?: string;
  companyFlowSticky?: boolean;
  companyFlowBelowTabs?: boolean;
  query?: IQueryGhos;
  onSelectData?: (company: IGho) => void;
  selectedData?: IGho[];
};

export const GhoGseTabContent = ({
  workspaceId,
  companyFlowSticky,
  companyFlowBelowTabs,
  ...props
}: GhoGseTabContentProps) => {
  const editor = useGhoEditorOptional();
  const isPageEditorOpen =
    !!editor &&
    editor.registerModal(ModalEnum.GHO_ADD).open &&
    editor.ghoData.layout === 'page';

  if (isPageEditorOpen) {
    return <GhoPageEditor />;
  }

  return (
    <GhosTable
      workspaceId={workspaceId}
      companyFlowSticky={companyFlowSticky}
      companyFlowBelowTabs={companyFlowBelowTabs}
      pageGhoLayout
      {...props}
    />
  );
};
