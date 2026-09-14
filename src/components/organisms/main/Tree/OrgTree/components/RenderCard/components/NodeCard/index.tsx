/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { FC, MouseEvent, useRef } from 'react';
import { useStore } from 'react-redux';

import AddIcon from '@mui/icons-material/Add';
import { Box, Checkbox } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import STooltip from 'components/atoms/STooltip';
import { HierarchySelect } from 'components/organisms/tagSelects/HierarchySelect';
import {
  IGhoState,
  selectGhoHierarchy,
  selectGhoId,
  setGhoState,
} from 'store/reducers/hierarchy/ghoSlice';
import {
  selectHierarchyNodeIsSelected,
  selectHierarchySelectionMode,
} from 'store/reducers/hierarchy/hierarchySlice';

import SCopyIcon from 'assets/icons/SCopyIcon';
import SDeleteIcon from 'assets/icons/SDeleteIcon';

import { firstNodeId } from 'core/constants/first-node-id.constant';
import { useAppDispatch } from 'core/hooks/useAppDispatch';
import { useAppSelector } from 'core/hooks/useAppSelector';
import { useHierarchyTypeLabels } from 'core/hooks/useHierarchyTypeLabels';
import { useModal } from 'core/hooks/useModal';
import { useObserverHide } from 'core/hooks/useObserverHide';
import { useOrgMultiWorkspaceMode } from 'core/hooks/useOrgMultiWorkspaceMode';
import { IHierarchy } from 'core/interfaces/api/IHierarchy';
import { useMutUpdateGho } from 'core/services/hooks/mutations/checklist/gho/useMutUpdateGho';
import { ORG_MULTI_WORKSPACE_DISABLED_HINT } from 'core/utils/org-workspace-query';

import { ModalEnum } from '../../../../../../../../../core/enums/modal.enums';
import { useHierarchyTreeActions } from '../../../../../../../../../core/hooks/useHierarchyTreeActions';
import { STagButton } from '../../../../../../../../atoms/STagButton';
import SText from '../../../../../../../../atoms/SText';
import { hierarchyNodeVisualIdentity } from '../../../../constants/hierarchy-node-visual.constant';
import { isHierarchyNodeSelectable } from '../../../../constants/hierarchy-selection.constant';
import { TreeTypeEnum } from '../../../../enums/tree-type.enums';
import { usePreventNode } from '../../../../hooks/usePreventNode';
import { ITreeMapObject } from '../../../../interfaces';
import {
  getEmbeddedWorkspaceIdFromTreeId,
  getHierarchyIdFromTreeId,
} from '../../../../utils/get-copy-hierarchy-destinations';
import { isUngroupedEstablishmentGroupTreeId } from '../../../../utils/attach-establishment-group-layer';
import { resolveHierarchyNodeTypeLabel } from '../../../../utils/resolve-hierarchy-node-type-label';
import { OptionsHelpSelect } from '../../../Selects/OptionsHelpSelect';
import { GhoSelectCard } from './Select/ghoSelect';
import { STSelectBox } from './styles';
import { INodeCardProps } from './types';

const NodeTypeHeader: FC<{ type: TreeTypeEnum; treeId?: string | number }> = ({
  type,
  treeId,
}) => {
  const typeLabels = useHierarchyTypeLabels();
  const visual = hierarchyNodeVisualIdentity[type];
  const label = isUngroupedEstablishmentGroupTreeId(treeId)
    ? 'Sem grupo'
    : resolveHierarchyNodeTypeLabel(type, typeLabels);
  const isSector = type === TreeTypeEnum.SECTOR;
  const isGroup = type === TreeTypeEnum.ESTABLISHMENT_GROUP;

  if (!label || !visual) return null;

  return (
    <SText
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        px: 2,
        py: 0.5,
        borderRadius: '3px',
        fontSize: isSector || isGroup ? 10.5 : 10,
        fontWeight: isSector || isGroup ? 800 : 700,
        letterSpacing: isSector || isGroup ? '0.06em' : '0.04em',
        lineHeight: 1.2,
        textTransform: 'uppercase',
        color: visual.headerColor,
        backgroundColor: visual.headerBg,
        maxWidth: '100%',
        border: isSector || isGroup ? `1px solid ${visual.border}` : 'none',
      }}
    >
      {label}
    </SText>
  );
};

const NodeLabel: FC<{ label: string }> = ({ label }) => {
  return (
    <STooltip minLength={25} withWrapper enterDelay={600} title={label}>
      <SText
        sx={{
          width: '100%',
          fontSize: 13,
          lineHeight: '16px',
          fontWeight: 600,
          whiteSpace: 'normal',
          wordBreak: 'break-word',
          textAlign: 'left',
        }}
        lineNumber={3}
      >
        {label}
      </SText>
    </STooltip>
  );
};

const SelectGho: FC<{
  isSelectedGho: boolean;
  handleAddGhoHierarchy: (e: MouseEvent<HTMLDivElement>) => void;
  node: ITreeMapObject;
  disabled?: boolean;
  disabledHint?: string;
}> = ({
  isSelectedGho,
  handleAddGhoHierarchy,
  node,
  disabled,
  disabledHint,
}) => {
  const ref = useRef<HTMLElement>(null);

  return (
    <STooltip
      withWrapper
      title={
        disabled
          ? disabledHint
          : `Click aqui para incluir o ${node.label.slice(0, 8)}${
              node.label.length > 9 ? '...' : ''
            } ao GSE`
      }
    >
      <STSelectBox
        ref={ref}
        selected={isSelectedGho ? 1 : 0}
        onClick={disabled ? undefined : handleAddGhoHierarchy}
        sx={disabled ? { opacity: 0.4, pointerEvents: 'auto' } : undefined}
      />
    </STooltip>
  );
};

export const NodeCard: FC<{ children?: any } & INodeCardProps> = ({
  handleClickCard,
  node,
  menuRef,
}) => {
  const { onOpenModal } = useModal();
  const updateMutation = useMutUpdateGho();
  const {
    editNodes,
    createEmptyCard,
    getPathById,
    isChild,
    getChildren,
    removeNodes,
  } = useHierarchyTreeActions();
  const { preventDelete } = usePreventNode();
  const isSelectedGho = useAppSelector(
    selectGhoHierarchy(getPathById(node.id) as string[]),
  );
  const GhoId = useAppSelector(selectGhoId);
  const selectionMode = useAppSelector(selectHierarchySelectionMode);
  const isSelected = useAppSelector(selectHierarchyNodeIsSelected(node.id));
  const canSelect = isHierarchyNodeSelectable(node);
  const store = useStore<any>();
  const dispatch = useAppDispatch();
  const { hide, ref } = useObserverHide();
  const isOrgMultiWorkspace = useOrgMultiWorkspaceMode();

  const handleAddCard = (e: MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (selectionMode || node.showRef) return;

    createEmptyCard(node.id);
    onOpenModal(ModalEnum.HIERARCHY_TREE_CARD);
  };

  const handleDeleteCard = (e: MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (selectionMode || node.showRef || !node.parentId) return;

    preventDelete(() => removeNodes(node.id), '', {
      inputConfirm: true,
    });
  };

  const onUpdateGho = (newHierarchyIds: string[]) => {
    if (node.showRef) return;
    if (isOrgMultiWorkspace) return;
    dispatch(setGhoState({ hierarchies: newHierarchyIds }));

    const newGhoState = store.getState().gho as IGhoState;

    if (GhoId)
      updateMutation.mutate({
        id: GhoId,
        hierarchies: newGhoState.hierarchies.map((hierarchy) => ({
          id: getHierarchyIdFromTreeId(hierarchy),
          workspaceId: getEmbeddedWorkspaceIdFromTreeId(hierarchy),
        })),
      });
  };

  const handleAddGhoHierarchy = (e: MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (isOrgMultiWorkspace) return;
    if (selectionMode || updateMutation.isLoading) return;
    if (node.showRef) return;

    const ghoState = store.getState().gho as IGhoState;
    let newHierarchyIds = [...ghoState.hierarchies];

    const isToRemove = ghoState.hierarchies.some(
      (hierarchyId) => hierarchyId === node.id,
    );
    if (isToRemove)
      newHierarchyIds = newHierarchyIds.filter(
        (hierarchyId) => hierarchyId !== node.id,
      );
    if (!isToRemove) newHierarchyIds.push(node.id as string);

    let selectedParent: string | number = '';
    const nodePath = getPathById(node.id).slice(0, -1);
    const isParentSelected = nodePath.some((hierarchy) => {
      const isSelected = ghoState.hierarchies.includes(hierarchy as string);
      if (isSelected) selectedParent = hierarchy;
      return isSelected;
    });

    newHierarchyIds = newHierarchyIds.filter(
      (hierarchyId) => node.id == hierarchyId || !isChild(node.id, hierarchyId),
    );

    if (!isParentSelected && node.id && node.parentId !== firstNodeId) {
      onUpdateGho(newHierarchyIds);
    }

    if (isParentSelected && node.id && node.parentId !== firstNodeId) {
      const children = Object.values(getChildren(selectedParent));

      children.forEach((child) => {
        if (
          child.id !== node.id &&
          !nodePath.includes(child.id) &&
          !children.find((fChild) => fChild.id === child.parentId)
        )
          newHierarchyIds.push(child.id as string);
      });

      newHierarchyIds = newHierarchyIds.filter(
        (hierarchyId) => ![node.id, ...nodePath].includes(String(hierarchyId)),
      );

      onUpdateGho(newHierarchyIds);
    }
  };

  const showRefSelect = node.showRef;
  const isHierarchy = ![
    TreeTypeEnum.COMPANY,
    TreeTypeEnum.ESTABLISHMENT_GROUP,
    TreeTypeEnum.WORKSPACE,
  ].includes(node.type);
  const showGhoSelect = !node.showRef && node.ghos && node.ghos.length > 0;
  const isCargoCard =
    node.type === TreeTypeEnum.OFFICE || node.type === TreeTypeEnum.SUB_OFFICE;
  const showCornerGhoBadge = isCargoCard && !node.showRef;
  const showOptionsSelect =
    !node.showRef &&
    !GhoId &&
    !isUngroupedEstablishmentGroupTreeId(node.id);
  const showPopperHelp =
    !node.showRef &&
    node.type === TreeTypeEnum.WORKSPACE &&
    !node.childrenIds?.length;
  const showGhoSelectButton = !hide && GhoId && isHierarchy;

  const showAddButton =
    !selectionMode &&
    !node.showRef &&
    !GhoId &&
    ![
      TreeTypeEnum.COMPANY,
      TreeTypeEnum.ESTABLISHMENT_GROUP,
      TreeTypeEnum.SUB_OFFICE,
    ].includes(node.type);

  const showDeleteButton =
    !selectionMode &&
    !node.showRef &&
    !GhoId &&
    !!node.parentId &&
    node.type !== TreeTypeEnum.COMPANY &&
    node.type !== TreeTypeEnum.ESTABLISHMENT_GROUP;

  const showHeaderActions =
    !hide &&
    (showGhoSelectButton ||
      showGhoSelect ||
      showCornerGhoBadge ||
      showOptionsSelect ||
      showRefSelect ||
      showAddButton ||
      showDeleteButton);

  return (
    <Box
      ref={ref}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        minHeight: 0,
        gap: 1,
      }}
      onClick={
        !selectionMode && GhoId && !isOrgMultiWorkspace
          ? handleAddGhoHierarchy
          : undefined
      }
    >
      {!showRefSelect && (
        <SFlex
          alignItems="center"
          justifyContent="space-between"
          width="100%"
          gap={1}
          sx={{ minHeight: 22 }}
        >
          <Box sx={{ minWidth: 0, textAlign: 'left', flexShrink: 0 }}>
            <NodeTypeHeader type={node.type} treeId={node.id} />
          </Box>
          <SFlex
            gap={1}
            alignItems="center"
            sx={{ flexShrink: 0, ml: 'auto', position: 'relative' }}
            onClick={(e) => e.stopPropagation()}
          >
            {selectionMode && canSelect && (
              <Checkbox
                size="small"
                checked={isSelected}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => {
                  e.stopPropagation();
                  handleClickCard();
                }}
                inputProps={{
                  'aria-label': `Selecionar ${node.label}`,
                }}
                sx={{ p: 0.25, flexShrink: 0 }}
              />
            )}
            {!selectionMode && showHeaderActions && (
              <>
                {showGhoSelectButton && (
                  <SelectGho
                    isSelectedGho={isSelectedGho}
                    handleAddGhoHierarchy={handleAddGhoHierarchy}
                    node={node}
                    disabled={isOrgMultiWorkspace}
                    disabledHint={ORG_MULTI_WORKSPACE_DISABLED_HINT}
                  />
                )}
                {(showGhoSelect || showCornerGhoBadge) && (
                  <GhoSelectCard node={node} cornerBadge />
                )}
                {showDeleteButton && (
                  <Box className="hierarchy-card-delete">
                    <STagButton
                      sx={{
                        pr: 1,
                        pl: 2,
                        color: 'grey.500',
                        '&:hover': { color: 'error.main' },
                      }}
                      onClick={handleDeleteCard}
                      icon={SDeleteIcon}
                      tooltipTitle="Excluir"
                    />
                  </Box>
                )}
                {showOptionsSelect && (
                  <OptionsHelpSelect
                    disabled={!!GhoId}
                    menuRef={menuRef}
                    node={node}
                    onEdit={handleClickCard}
                  />
                )}
                {showAddButton && (
                  <Box sx={{ position: 'relative' }}>
                    <STagButton
                      sx={{ pr: 1, pl: 2 }}
                      onClick={handleAddCard}
                      icon={AddIcon}
                      active
                      bg={'success.main'}
                      tooltipTitle="Adicionar"
                    />
                    {showPopperHelp && (
                      <Box
                        sx={{
                          position: 'absolute',
                          right: 'calc(-50% + 10px)',
                          top: 34,
                          zIndex: 2,
                        }}
                      >
                        <SText
                          sx={{
                            backgroundColor: 'background.paper',
                            px: 8,
                            borderRadius: 1,
                            py: 3,
                            boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.4)',
                            whiteSpace: 'nowrap',
                          }}
                          fontSize={13}
                        >
                          Click aqui para incluir um setor
                        </SText>
                        <Box
                          sx={{
                            top: -13,
                            right: 'calc(50% - 15px)',
                            height: 13,
                            width: 30,
                            position: 'absolute',
                            overflowY: 'hidden',
                          }}
                        >
                          <Box
                            sx={{
                              boxShadow: '0px 0px 8px rgba(0, 0, 0, 0.5)',
                              backgroundColor: 'background.paper',
                              width: 14,
                              height: 14,
                              right: 'calc(50% - 7px)',
                              position: 'absolute',
                              transform: 'rotate(45deg)',
                              top: 7,
                            }}
                          />
                        </Box>
                      </Box>
                    )}
                  </Box>
                )}
              </>
            )}
          </SFlex>
        </SFlex>
      )}

      <Box sx={{ width: '100%', minWidth: 0, textAlign: 'left' }}>
        <NodeLabel label={node.label} />
      </Box>

      {showRefSelect && isHierarchy && (
        <SFlex
          alignItems="center"
          width="100%"
          onClick={(e) => e.stopPropagation()}
        >
          <HierarchySelect
            tooltipText={(textField) => (
              <p>
                <p>Selecione a hierarquia que deseja cópiar</p>
                <p>cópiar em: {textField}</p>
              </p>
            )}
            text="Selecionar cópia"
            icon={SCopyIcon}
            handleSelect={(hierarchy: IHierarchy) =>
              editNodes([{ id: node.id, idRef: hierarchy.id }], true)
            }
            companyId={node.copyCompanyId}
            selectedId={node.idRef}
          />
        </SFlex>
      )}
    </Box>
  );
};
