import React, { FC, useEffect, useRef } from 'react';

import { Box } from '@mui/material';
import { ModalAddEmployee } from 'components/organisms/modals/ModalAddEmployees';
import { ModalSelectHierarchy } from 'components/organisms/modals/ModalSelectHierarchy';
import { ModalSelectWorkspace } from 'components/organisms/modals/ModalSelectWorkspace';
import { useRouter } from 'next/router';
import { selectGhoOpen } from 'store/reducers/hierarchy/ghoSlice';
import { setHierarchySearch } from 'store/reducers/hierarchy/hierarchySlice';
import { selectRiskAddExpand } from 'store/reducers/hierarchy/riskAddSlice';

import { useAppDispatch } from 'core/hooks/useAppDispatch';
import { useAppSelector } from 'core/hooks/useAppSelector';

import { useZoom } from '../../../../../core/hooks/useZoom';
import { TreeNode } from './components';
import { BottomButton } from './components/BottomButton';
import { GhoTool } from './components/GhoTool';
import { HierarchyFilter } from './components/GhoTool/components/HierarchyFilter';
import { LoadingFeedback } from './components/LoadingFeedback';
import { ModalEditCard } from './components/ModalEditCard';
import { MouseControl } from './components/MouseControl';
import { RiskToolSlider } from './components/RiskTool';
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
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(setHierarchySearch(''));
  }, [dispatch]);

  const { query } = useRouter();
  const isRiskOpen = query.riskGroupId;
  useZoom(orgContainerRef);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: '100%',
      }}
    >
      <HierarchyFilter />
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
        <ModalAddEmployee />
        <ModalSelectWorkspace />
        <ModalSelectHierarchy />
      </Box>
      <STGhoBox
        expanded={selectExpanded ? 1 : 0}
        gho={isGhoOpen ? 1 : 0}
        risk_init={isRiskOpen ? 1 : 0}
      >
        {isRiskOpen && <RiskToolSlider />}
        {!isRiskOpen && <GhoTool />}
      </STGhoBox>
    </Box>
  );
};
