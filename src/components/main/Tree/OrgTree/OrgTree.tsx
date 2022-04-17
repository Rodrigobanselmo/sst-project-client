import React, { FC, useRef } from 'react';

import { Box, Slide } from '@mui/material';

import { useZoom } from '../../../../core/hooks/useZoom';
import { TreeNode } from './components';
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
          right: 10,
        }}
      >
        <Slide direction="left" in={true} mountOnEnter unmountOnExit>
          <Box
            sx={{
              paddingRight: 4,
              height: '100%',
              paddingBottom: 8,
            }}
          >
            <SidebarOrg />
          </Box>
        </Slide>
      </Box>
    </Box>
  );
};
