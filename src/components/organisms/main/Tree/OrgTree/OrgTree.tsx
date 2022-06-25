import React, { FC, useRef } from 'react';

import { Box } from '@mui/material';
import { useRouter } from 'next/router';
import { selectGhoOpen } from 'store/reducers/hierarchy/ghoSlice';
import { selectRiskAddExpand } from 'store/reducers/hierarchy/riskAddSlice';

import { useAppSelector } from 'core/hooks/useAppSelector';

import { useZoom } from '../../../../../core/hooks/useZoom';
import { TreeNode } from './components';
import { BottomButton } from './components/BottomButton';
import { GhoTool } from './components/GhoTool';
import { LoadingFeedback } from './components/LoadingFeedback';
import { ModalEditCard } from './components/ModalEditCard';
import { MouseControl } from './components/MouseControl';
import { SidebarOrg } from './components/RiskTool';
import { IOrgTreeProps } from './interfaces';
import { OrgTree, OrgTreeContainer, STGhoBox } from './OrgTree.styles';

export const OrgTreeComponent: FC<IOrgTreeProps> = ({
  collapsable = true,
  horizontal = false,
  ...props
}) => {
  const orgContainerRef = useRef<HTMLDivElement>(null);
  const selectExpanded = useAppSelector(selectRiskAddExpand);
  const isGhoOpen = useAppSelector(selectGhoOpen);

  const { query } = useRouter();
  const isRiskOpen = query.riskGroupId;
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
        {(!selectExpanded || !isRiskOpen) && (
          <>
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
          </>
        )}
        <ModalEditCard />
      </Box>
      <STGhoBox
        expanded={selectExpanded ? 1 : 0}
        gho={isGhoOpen ? 1 : 0}
        risk_init={isRiskOpen ? 1 : 0}
      >
        {isRiskOpen && <SidebarOrg />}
        {!isRiskOpen && <GhoTool />}
      </STGhoBox>
    </Box>
  );
};
