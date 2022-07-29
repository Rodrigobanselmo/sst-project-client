import React, { FC, useEffect, useRef } from 'react';

import { Box, Icon, Stack } from '@mui/material';
import SSlider from 'components/atoms/SSlider';
import { useRouter } from 'next/router';
import { selectGhoOpen } from 'store/reducers/hierarchy/ghoSlice';
import { setHierarchySearch } from 'store/reducers/hierarchy/hierarchySlice';
import { selectRiskAddExpand } from 'store/reducers/hierarchy/riskAddSlice';

import SZooInIcon from 'assets/icons/SZooInIcon';
import SZooOutIcon from 'assets/icons/SZooOutIcon';

import { useAppDispatch } from 'core/hooks/useAppDispatch';
import { useAppSelector } from 'core/hooks/useAppSelector';

import { useZoom } from '../../../../../core/hooks/useZoom';
import { TreeNode } from './components';
import { BottomButton } from './components/BottomButton';
import { GhoTool } from './components/GhoTool';
import { HierarchyFilter } from './components/GhoTool/components/HierarchyFilter';
import { LoadingFeedback } from './components/LoadingFeedback';
import { MouseControl } from './components/MouseControl';
import { RiskToolSlider } from './components/RiskTool';
import { IOrgTreeProps } from './interfaces';
import { OrgTree, OrgTreeContainer, STGhoBox } from './OrgTree.styles';

export const OrgTreeComponent: FC<IOrgTreeProps> = ({
  collapsable = true,
  horizontal = false,
  showGHO = true,
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
  const { onChangeZoom, onGetScale } = useZoom(orgContainerRef);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: '100%',
        flex: 1,
      }}
    >
      <HierarchyFilter />
      <Box sx={{ width: 278, ml: 17 }}>
        <Stack spacing={5} direction="row" sx={{ mb: 1 }} alignItems="center">
          <SSlider
            color="secondary"
            defaultValue={100}
            onChange={(e, v) => onChangeZoom(onGetScale(v as number, 100, 0))}
          />
          <Icon
            sx={{
              fontSize: 20,
              transform: 'translateX(2px)',
              color: 'grey.500',
            }}
            component={SZooInIcon}
          />
        </Stack>
      </Box>
      <Box
        sx={{
          position: 'relative',
          height: '100%',
          width: '100%',
          flex: 1,
        }}
      >
        {(!selectExpanded || !isRiskOpen) && (
          <>
            <LoadingFeedback />
            {showGHO && <BottomButton />}
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
      </Box>
      {showGHO && (
        <STGhoBox
          expanded={selectExpanded ? 1 : 0}
          gho={isGhoOpen ? 1 : 0}
          risk_init={isRiskOpen ? 1 : 0}
        >
          {isRiskOpen && <RiskToolSlider />}
          {!isRiskOpen && <GhoTool />}
        </STGhoBox>
      )}
    </Box>
  );
};
