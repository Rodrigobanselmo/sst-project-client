/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/display-name */
import React, { FC, useRef } from 'react';

import { Box } from '@mui/material';

import { useZoom } from '../../../core/hooks/useZoom';
import { useQueryRisk } from '../../../core/services/hooks/queries/useQueryRisk';
import { TreeNode } from './components';
import { ModalEditCard } from './components/ModalEditCard';
import { MouseControl } from './components/MouseControl';
import { IOrgTreeProps } from './interfaces';
import { OrgTree, OrgTreeContainer } from './OrgTree.styles';

export const OrgTreeComponent: FC<IOrgTreeProps> = ({
  collapsable = true,
  horizontal = false,
  ...props
}) => {
  useQueryRisk();

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
