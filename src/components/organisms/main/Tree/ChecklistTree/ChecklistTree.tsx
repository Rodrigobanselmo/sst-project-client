import React, { FC, useRef } from 'react';

import { Box } from '@mui/material';

import { useZoom } from '../../../../../core/hooks/useZoom';
import { useQueryAllRisk } from '../../../../../core/services/hooks/queries/useQueryRiskAll';
import { OrgTree, OrgTreeContainer } from './ChecklistTree.styles';
import { TreeNode } from './components';
import { LoadingFeedback } from './components/LoadingFeedback';
import { ModalEditCard } from './components/ModalEditCard';
import { MouseControl } from './components/MouseControl';
import { IOrgTreeProps } from './interfaces';

export const ChecklistTreeComponent: FC<{ children?: any } & IOrgTreeProps> = ({
  collapsable = true,
  horizontal = false,
  ...props
}) => {
  // useQueryAllRisk();

  const orgContainerRef = useRef<HTMLDivElement>(null);

  useZoom(orgContainerRef);

  return (
    <Box
      sx={{
        position: 'relative',
        height: '100%',
        width: '100%',
      }}
    >
      <LoadingFeedback />
      <MouseControl orgContainerRef={orgContainerRef} />
      <OrgTreeContainer
        id="org-tree-container"
        ref={orgContainerRef}
        horizontal={horizontal}
      >
        <OrgTree horizontal={horizontal}>
          <TreeNode
            horizontal={horizontal}
            collapsable={collapsable}
            {...props}
          />
        </OrgTree>
      </OrgTreeContainer>
      <ModalEditCard />
    </Box>
  );
};
