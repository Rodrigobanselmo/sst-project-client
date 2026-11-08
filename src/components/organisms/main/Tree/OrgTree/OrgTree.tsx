import { GseFloatingPanel } from './components/GseVisualAssistance/GseFloatingPanel';
import { GseReviewNavigation } from './components/GseVisualAssistance/GseReviewNavigation';
import React, { FC, useEffect, useRef } from 'react';

import { Box, Icon, Stack } from '@mui/material';
import SSlider from 'components/atoms/SSlider';
import { useRouter } from 'next/router';
import { selectGhoOpen } from 'store/reducers/hierarchy/ghoSlice';
import {
  setCopyDndActive,
  setHierarchySearch,
} from 'store/reducers/hierarchy/hierarchySlice';
import { selectRiskAddExpand } from 'store/reducers/hierarchy/riskAddSlice';

import SZooInIcon from 'assets/icons/SZooInIcon';
import SZooOutIcon from 'assets/icons/SZooOutIcon';

import { useAppDispatch } from 'core/hooks/useAppDispatch';
import { useAppSelector } from 'core/hooks/useAppSelector';
import { useOrgMultiWorkspaceMode } from 'core/hooks/useOrgMultiWorkspaceMode';
import { StructuralArchivedButton } from '@v2/features/sst-operational/StructuralArchivedButton';

import { MIN_TREE_SCALE, useZoom } from '../../../../../core/hooks/useZoom';
import { TreeNode } from './components';
import { BottomButton } from './components/BottomButton';
import { GhoTool } from './components/GhoTool';
import { HierarchyFilter } from './components/GhoTool/components/HierarchyFilter';
import { LoadingFeedback } from './components/LoadingFeedback';
import { MouseControl } from './components/MouseControl';
import { RiskTool } from './components/RiskTool/RiskTool';
import { IOrgTreeProps } from './interfaces';
import { GseVisualAssistanceProvider } from './components/GseVisualAssistance/GseVisualAssistance';
import { useGseVisualAssistance } from './components/GseVisualAssistance/GseVisualAssistance.context';
import { OrgTree, OrgTreeContainer, STGhoBox } from './OrgTree.styles';

const OrgTreeView: FC<{ children?: any } & IOrgTreeProps> = ({
  collapsable = true,
  horizontal = false,
  showGHO = true,
  ...props
}) => {
  const assistance = useGseVisualAssistance();
  const assisted = !!assistance?.active;
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
  const { onChangeZoom, scale, zoomStyle } = useZoom(orgContainerRef, {
    wheelZoom: false,
  });

  return (
    <Box
      data-gse-organogram-viewport
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: 0,
        width: '100%',
        flex: 1,
      }}
    >
      <GseReviewNavigation
        containerRef={orgContainerRef}
        onChangeZoom={onChangeZoom}
        environmentWorkspaceId={
          showGHO && !assisted && isGhoOpen && !isRiskOpen && !isOrgMultiWorkspace &&
          typeof query.tabWorkspaceId === 'string'
            ? query.tabWorkspaceId
            : undefined
        }
      />
      {!assisted && <HierarchyFilter />}
      {query.companyId && !assisted && (
        <Box sx={{ mx: '16px', mb: '16px' }}>
          <StructuralArchivedButton
            companyId={String(query.companyId)}
            table="Hierarchy"
            label="Consultar cargos e setores encerrados"
          />
        </Box>
      )}
      <Box sx={{ width: 278, ml: 17 }}>
        <Stack spacing={5} direction="row" sx={{ mb: 1 }} alignItems="center">
          <SSlider
            color="secondary"
            aria-label="Zoom do organograma"
            min={MIN_TREE_SCALE * 100}
            max={100}
            value={Math.round(scale * 100)}
            onChange={(_, value) => {
              if (typeof value === 'number') onChangeZoom(value / 100);
            }}
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
        <Box
          sx={{
            position: 'absolute',
            bottom: 20,
            right: 88,
            // Above the draggable assistance (1200), below modal dialogs (1300).
            zIndex: 1201,
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
        {(assisted || !selectExpanded || !isRiskOpen) && (
          <>
            <MouseControl orgContainerRef={orgContainerRef} />
            <OrgTreeContainer
              id="org-tree-container"
              ref={orgContainerRef}
              style={zoomStyle}
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
      {showGHO && assisted && (
        <GseFloatingPanel>
          <GhoTool />
        </GseFloatingPanel>
      )}
      {showGHO && !assisted && (
        isRiskOpen ? (
          <STGhoBox
            expanded={selectExpanded ? 1 : 0}
            gho={isGhoOpen ? 1 : 0}
            risk_init={1}
          >
            <RiskTool />
          </STGhoBox>
        ) : (
          <GhoTool key="environment" environmentOnly />
        )
      )}
    </Box>
  );
};

export const OrgTreeComponent: FC<{ children?: any } & IOrgTreeProps> = (
  props,
) =>
  props.showGHO === false ? (
    <OrgTreeView {...props} />
  ) : (
    <GseVisualAssistanceProvider>
      <OrgTreeView {...props} />
    </GseVisualAssistanceProvider>
  );
