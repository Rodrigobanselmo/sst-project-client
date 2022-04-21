import React, { FC, useRef } from 'react';

import { Box } from '@mui/material';
import { selectGhoOpen } from 'store/reducers/hierarchy/ghoSlice';
import {
  selectRiskAddExpand,
  selectRiskAddInit,
} from 'store/reducers/hierarchy/riskAddSlice';

import { useAppSelector } from 'core/hooks/useAppSelector';

import { useZoom } from '../../../../core/hooks/useZoom';
import { TreeNode } from './components';
import { BottomButton } from './components/BottomButton';
import { LoadingFeedback } from './components/LoadingFeedback';
import { ModalEditCard } from './components/ModalEditCard';
import { MouseControl } from './components/MouseControl';
import { SidebarOrg } from './components/SidebarOrg';
import { IOrgTreeProps } from './interfaces';
import { OrgTree, OrgTreeContainer, STGhoBox } from './OrgTree.styles';

export const OrgTreeComponent: FC<IOrgTreeProps> = ({
  collapsable = true,
  horizontal = false,
  ...props
}) => {
  const orgContainerRef = useRef<HTMLDivElement>(null);
  const riskInit = useAppSelector(selectRiskAddInit);
  const selectExpanded = useAppSelector(selectRiskAddExpand);
  const isGhoOpen = useAppSelector(selectGhoOpen);

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
      <STGhoBox
        expanded={selectExpanded ? 1 : 0}
        gho={isGhoOpen ? 1 : 0}
        risk_init={riskInit ? 1 : 0}
      >
        <SidebarOrg />
      </STGhoBox>
    </Box>
  );
};
