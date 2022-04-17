import React, { FC, useRef } from 'react';

import { Box } from '@mui/material';

import { useZoom } from '../../../../core/hooks/useZoom';
import { TreeNode } from './components';
import { BottomButton } from './components/BottomButton';
import { LoadingFeedback } from './components/LoadingFeedback';
import { ModalEditCard } from './components/ModalEditCard';
import { MouseControl } from './components/MouseControl';
import { SidebarOrg } from './components/SidebarOrg';
import { IOrgTreeProps } from './interfaces';
import { OrgTree, OrgTreeContainer } from './OrgTree.styles';

export const OrgTreeComponent: FC<IOrgTreeProps> = ({
  collapsable = true,
  horizontal = false,
  ...props
}) => {
  const orgContainerRef = useRef<HTMLDivElement>(null);

  useZoom(orgContainerRef);

  return (
    <Box sx={{ display: 'flex', height: '100%', width: '100%' }}>
      <Box
        sx={{
          position: 'relative',
          height: '100%',
          width: '100%',
        }}
      >
        <LoadingFeedback />
        <BottomButton />
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
      <Box
        sx={{
          height: '95%',
          width: '306px',
          position: 'absolute',
          right: 45,
        }}
      >
        <SidebarOrg />
      </Box>
    </Box>
  );
};
