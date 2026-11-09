import { GseFloatingPanel } from './components/GseVisualAssistance/GseFloatingPanel';
import { GseReviewNavigation } from './components/GseVisualAssistance/GseReviewNavigation';
import React, { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { Box, Icon, Stack } from '@mui/material';
import SSlider from 'components/atoms/SSlider';
import { useRouter } from 'next/router';
import { selectGhoOpen } from 'store/reducers/hierarchy/ghoSlice';
import {
  clearSelectedNodeIds,
  selectAllHierarchyTreeNodes,
  setCopyDndActive,
  setHierarchySearch,
} from 'store/reducers/hierarchy/hierarchySlice';
import { selectRiskAddExpand } from 'store/reducers/hierarchy/riskAddSlice';

import SZooInIcon from 'assets/icons/SZooInIcon';
import SZooOutIcon from 'assets/icons/SZooOutIcon';

import { useAccess } from 'core/hooks/useAccess';
import { PermissionEnum } from 'project/enum/permission.enum';
import { useAppDispatch } from 'core/hooks/useAppDispatch';
import { useAppSelector } from 'core/hooks/useAppSelector';
import { useOrgMultiWorkspaceMode } from 'core/hooks/useOrgMultiWorkspaceMode';
import { StructuralArchivedButton } from '@v2/features/sst-operational/StructuralArchivedButton';

import { MIN_TREE_SCALE, useZoom } from '../../../../../core/hooks/useZoom';
import { TreeNode } from './components';
import { BottomButton } from './components/BottomButton';
import { InventoryOrganogramPanel } from './components/InventoryOrganogram/InventoryOrganogramPanel';
import { GhoTool } from './components/GhoTool';
import { HierarchyFilter } from './components/GhoTool/components/HierarchyFilter';
import { HierarchyLegend } from './components/HierarchyLegend';
import { TreeTypeEnum } from './enums/tree-type.enums';
import { projectVisibleHierarchy } from './utils/project-visible-hierarchy';
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

  const { query, pathname } = useRouter();
  const { isMaster, isValidPermissions } = useAccess();
  const companyId = typeof query.companyId === 'string' ? query.companyId : '';
  const canReviewInventory = Boolean(companyId) && pathname.endsWith('/hierarquia') &&
    (isMaster || (isValidPermissions([PermissionEnum.EMPLOYEE]) &&
      isValidPermissions([PermissionEnum.HOMO_GROUP])));
  const scope = JSON.stringify([companyId, query.tabWorkspaceGroupId, query.tabWorkspaceId, query.tabWorkspaceIds]);
  const [inventoryScope, setInventoryScope] = useState<string | null>(null);
  const [inventoryCanvas, setInventoryCanvas] = useState<HTMLDivElement | null>(null);
  const inventoryOpen = canReviewInventory && inventoryScope === scope;
  const onInventoryChange = useCallback((open: boolean) => {
    setInventoryScope(open ? scope : null);
  }, [scope]);
  useEffect(() => setInventoryScope(null), [scope]);
  const nodes = useAppSelector(selectAllHierarchyTreeNodes);
  const [hiddenLevels, setHiddenLevels] = useState<Set<TreeTypeEnum>>(
    () => new Set(),
  );
  useEffect(() => setHiddenLevels(new Set()), [query.companyId]);

  const visibleHierarchy = useMemo(
    () => hiddenLevels.size
      ? projectVisibleHierarchy(nodes, hiddenLevels, collapsable)
      : undefined,
    [nodes, hiddenLevels, collapsable],
  );

  const toggleLevel = (type: TreeTypeEnum) => {
    dispatch(clearSelectedNodeIds());
    setHiddenLevels((previous) => {
      const next = new Set(previous);
      if (!next.delete(type)) next.add(type);
      return next;
    });
  };

  const revealLinkLevel = (id: string) => {
    const type = nodes[id]?.type;
    if (!type || !hiddenLevels.has(type)) return;
    setHiddenLevels((previous) => {
      const next = new Set(previous);
      next.delete(type);
      return next;
    });
  };

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
        onRevealTarget={revealLinkLevel}
        environmentWorkspaceId={
          showGHO && !assisted && isGhoOpen && !isRiskOpen && !isOrgMultiWorkspace &&
          typeof query.tabWorkspaceId === 'string'
            ? query.tabWorkspaceId
            : undefined
        }
      />
      {!assisted && (
        <HierarchyFilter renderedIds={visibleHierarchy?.renderedIds}>
          {query.companyId && (
            <StructuralArchivedButton
              companyId={String(query.companyId)}
              table="Hierarchy"
              label="Consultar cargos e setores encerrados"
            />
          )}
        </HierarchyFilter>
      )}
      <HierarchyLegend
        hiddenLevels={hiddenLevels}
        onToggle={toggleLevel}
        onReset={() => {
          dispatch(clearSelectedNodeIds());
          setHiddenLevels(new Set());
        }}
      />
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
          {showGHO && (
            <BottomButton
              inventoryOpen={inventoryOpen}
              onInventoryChange={canReviewInventory ? onInventoryChange : undefined}
            />
          )}
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
              {inventoryOpen && (
                <Box ref={setInventoryCanvas}
                  sx={{ '&:not(:empty) + [data-live-hierarchy]': { display: 'none' } }}
                />
              )}
              <Box data-live-hierarchy>
                {visibleHierarchy && visibleHierarchy.roots.length === 0 && (
                  <Box role="status" sx={{ color: 'text.secondary' }}>
                    Nenhum item encontrado nos níveis visíveis.
                  </Box>
                )}
                <OrgTree
                  horizontal={horizontal}
                  className={visibleHierarchy ? 'org-tree-compact' : undefined}
                >
                  <TreeNode
                    horizontal={horizontal}
                    collapsable={collapsable}
                    visibleHierarchy={visibleHierarchy}
                    {...props}
                  />
                </OrgTree>
              </Box>
            </OrgTreeContainer>
          </>
        )}
      </Box>
      {showGHO && inventoryOpen && (
        <InventoryOrganogramPanel
          companyId={companyId}
          canvas={inventoryCanvas}
          onClose={() => onInventoryChange(false)}
        />
      )}
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
