import React, { FC, useEffect, useRef } from 'react';

import { Box, Icon, Stack } from '@mui/material';
import SSlider from 'components/atoms/SSlider';
import { useRouter } from 'next/router';
import { selectGhoOpen } from 'store/reducers/hierarchy/ghoSlice';
import { setCopyDndActive, setHierarchySearch } from 'store/reducers/hierarchy/hierarchySlice';
import { selectRiskAddExpand } from 'store/reducers/hierarchy/riskAddSlice';

import SZooInIcon from 'assets/icons/SZooInIcon';
import SZooOutIcon from 'assets/icons/SZooOutIcon';

import { useAppDispatch } from 'core/hooks/useAppDispatch';
import { useAppSelector } from 'core/hooks/useAppSelector';
import { useOrgMultiWorkspaceMode } from 'core/hooks/useOrgMultiWorkspaceMode';

import { useZoom } from '../../../../../core/hooks/useZoom';
import { TreeNode } from './components';
import { BottomButton } from './components/BottomButton';
import { GhoTool } from './components/GhoTool';
import { HierarchyFilter } from './components/GhoTool/components/HierarchyFilter';
import { LoadingFeedback } from './components/LoadingFeedback';
import { MouseControl } from './components/MouseControl';
import { RiskTool } from './components/RiskTool/RiskTool';
import { IOrgTreeProps } from './interfaces';
import { OrgTree, OrgTreeContainer, STGhoBox } from './OrgTree.styles';

export const OrgTreeComponent: FC<{ children?: any } & IOrgTreeProps> = ({
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

  useEffect(() => {
    return () => {
      dispatch(setCopyDndActive(false));
    };
  }, [dispatch]);

  const { query } = useRouter();
  const isOrgMultiWorkspace = useOrgMultiWorkspaceMode();
  const isRiskOpen = Boolean(query.riskGroupId) && !isOrgMultiWorkspace;
  const { onChangeZoom, onGetScale } = useZoom(orgContainerRef);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: 0,
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
          width: '100%',
          flex: 1,
          minHeight: 0,
        }}
      >
        {(!selectExpanded || !isRiskOpen) && (
          <>
            <Box
              sx={{
                position: 'absolute',
                bottom: 20,
                right: 88,
                zIndex: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                flexWrap: 'wrap',
                gap: 2,
                maxWidth: 'calc(100% - 108px)',
              }}
            >
              <LoadingFeedback />
              {showGHO && <BottomButton />}
            </Box>
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
          gho={isGhoOpen && !isOrgMultiWorkspace ? 1 : 0}
          risk_init={isRiskOpen ? 1 : 0}
        >
          {isRiskOpen && <RiskTool />}
          {!isRiskOpen && <GhoTool />}
        </STGhoBox>
      )}
    </Box>
  );
};
