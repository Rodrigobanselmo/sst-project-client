/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { FC, MouseEvent, useRef } from 'react';
import { useStore } from 'react-redux';

import AddIcon from '@mui/icons-material/Add';
import { Box } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import STooltip from 'components/atoms/STooltip';
import { HierarchySelect } from 'components/organisms/tagSelects/HierarchySelect';
import {
  IGhoState,
  selectGhoHierarchy,
  selectGhoId,
  setGhoState,
} from 'store/reducers/hierarchy/ghoSlice';

import SCopyIcon from 'assets/icons/SCopyIcon';
import SDeleteIcon from 'assets/icons/SDeleteIcon';

import { firstNodeId } from 'core/constants/first-node-id.constant';
import { useAppDispatch } from 'core/hooks/useAppDispatch';
import { useAppSelector } from 'core/hooks/useAppSelector';
import { useModal } from 'core/hooks/useModal';
import { useObserverHide } from 'core/hooks/useObserverHide';
import { IHierarchy } from 'core/interfaces/api/IHierarchy';
import { useMutUpdateGho } from 'core/services/hooks/mutations/checklist/gho/useMutUpdateGho';

import { ModalEnum } from '../../../../../../../../../core/enums/modal.enums';
import { useHierarchyTreeActions } from '../../../../../../../../../core/hooks/useHierarchyTreeActions';
import { STagButton } from '../../../../../../../../atoms/STagButton';
import SText from '../../../../../../../../atoms/SText';
import { hierarchyNodeVisualIdentity } from '../../../../constants/hierarchy-node-visual.constant';
import { nodeTypesConstant } from '../../../../constants/node-type.constant';
import { TreeTypeEnum } from '../../../../enums/tree-type.enums';
import { usePreventNode } from '../../../../hooks/usePreventNode';
import { ITreeMapObject } from '../../../../interfaces';
import { OptionsHelpSelect } from '../../../Selects/OptionsHelpSelect';
import { EmployeeSelectCard } from './Select/employeeSelect';
import { GhoSelectCard } from './Select/ghoSelect';
import { STSelectBox } from './styles';
import { INodeCardProps } from './types';

const NodeTypeHeader: FC<{ type: TreeTypeEnum }> = ({ type }) => {
  const visual = hierarchyNodeVisualIdentity[type];
  const label = nodeTypesConstant[type]?.name;
  const isSector = type === TreeTypeEnum.SECTOR;

  if (!label || !visual) return null;

  return (
    <SText
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        px: 2,
        py: 0.5,
        borderRadius: '3px',
        fontSize: isSector ? 10.5 : 10,
        fontWeight: isSector ? 800 : 700,
        letterSpacing: isSector ? '0.06em' : '0.04em',
        lineHeight: 1.2,
        textTransform: 'uppercase',
        color: visual.headerColor,
        backgroundColor: visual.headerBg,
        maxWidth: '100%',
        border: isSector ? `1px solid ${visual.border}` : 'none',
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
}> = ({ isSelectedGho, handleAddGhoHierarchy, node }) => {
  const ref = useRef<HTMLElement>(null);

  return (
    <STooltip
      title={`Click aqui para incluir o ${node.label.slice(0, 8)}${
        node.label.length > 9 ? '...' : ''
      } ao GSE`}
    >
      <STSelectBox
        ref={ref}
        selected={isSelectedGho ? 1 : 0}
        onClick={handleAddGhoHierarchy}
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
  const store = useStore<any>();
  const dispatch = useAppDispatch();
  const { hide, ref } = useObserverHide();

  const handleAddCard = (e: MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (node.showRef) return;

    createEmptyCard(node.id);
    onOpenModal(ModalEnum.HIERARCHY_TREE_CARD);
  };

  const handleDeleteCard = (e: MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (node.showRef || !node.parentId) return;

    preventDelete(() => removeNodes(node.id), '', {
      inputConfirm: true,
    });
  };

  const onUpdateGho = (newHierarchyIds: string[]) => {
    if (node.showRef) return;
    dispatch(setGhoState({ hierarchies: newHierarchyIds }));

    const newGhoState = store.getState().gho as IGhoState;

    if (GhoId)
      updateMutation.mutate({
        id: GhoId,
        hierarchies: newGhoState.hierarchies.map((hierarchy) => ({
          id: hierarchy.split('//')[0],
          workspaceId: hierarchy.split('//')[1],
        })),
      });
  };

  const handleAddGhoHierarchy = (e: MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (updateMutation.isLoading) return;
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
  const isHierarchy = ![TreeTypeEnum.COMPANY, TreeTypeEnum.WORKSPACE].includes(
    node.type,
  );
  const showGhoSelect = !node.showRef && node.ghos && node.ghos.length > 0;
  const isCargoCard =
    node.type === TreeTypeEnum.OFFICE || node.type === TreeTypeEnum.SUB_OFFICE;
  const showCornerGhoBadge = isCargoCard && !node.showRef;
  const showEmployeeIndicator =
    isCargoCard && !node.showRef && (node.employeesCount ?? 0) > 0;
  const showOptionsSelect = !node.showRef && !GhoId;
  const showPopperHelp =
    !node.showRef &&
    node.type === TreeTypeEnum.WORKSPACE &&
    !node.childrenIds?.length;
  const showGhoSelectButton = !hide && GhoId && isHierarchy;

  const showAddButton =
    !node.showRef &&
    !GhoId &&
    ![TreeTypeEnum.COMPANY, TreeTypeEnum.SUB_OFFICE].includes(node.type);

  const showDeleteButton =
    !node.showRef &&
    !GhoId &&
    !!node.parentId &&
    node.type !== TreeTypeEnum.COMPANY;

  const showFooter =
    !hide &&
    (showGhoSelectButton ||
      showGhoSelect ||
      showCornerGhoBadge ||
      showEmployeeIndicator ||
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
        minHeight: '100%',
        gap: 2.5,
      }}
      onClick={GhoId ? handleAddGhoHierarchy : undefined}
    >
      {/* 1. Cabeçalho — tipo do nó */}
      {!showRefSelect && (
        <Box sx={{ width: '100%', textAlign: 'left' }}>
          <NodeTypeHeader type={node.type} />
        </Box>
      )}

      {/* 2. Conteúdo — nome com largura total */}
      <Box sx={{ width: '100%', flex: 1, minWidth: 0, textAlign: 'left' }}>
        <NodeLabel label={node.label} />
      </Box>

      {/* 3. Rodapé de ações */}
      {showFooter && (
        <SFlex
          gap={1.5}
          alignItems="center"
          width="100%"
          sx={{
            mt: 'auto',
            minHeight: 24,
            pt: 0.5,
          }}
        >
          <SFlex
            gap={1.5}
            alignItems="center"
            sx={{ flex: 1, minWidth: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            {showGhoSelectButton && (
              <SelectGho
                isSelectedGho={isSelectedGho}
                handleAddGhoHierarchy={handleAddGhoHierarchy}
                node={node}
              />
            )}
            {(showGhoSelect || showCornerGhoBadge) && (
              <GhoSelectCard node={node} cornerBadge />
            )}
            {showEmployeeIndicator && <EmployeeSelectCard node={node} />}
            {showRefSelect && isHierarchy && (
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
            )}
          </SFlex>

          <SFlex
            gap={1}
            alignItems="center"
            sx={{ flexShrink: 0, position: 'relative' }}
            onClick={(e) => e.stopPropagation()}
          >
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
          </SFlex>
        </SFlex>
      )}
    </Box>
  );
};
