/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { FC, MouseEvent, useEffect, useRef, useState } from 'react';
import { useStore } from 'react-redux';

import AddIcon from '@mui/icons-material/Add';
import { Box, Stack } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import STooltip from 'components/atoms/STooltip';
import {
  IGhoState,
  selectGhoHierarchy,
  selectGhoId,
  setGhoState,
} from 'store/reducers/hierarchy/ghoSlice';

import { firstNodeId } from 'core/constants/first-node-id.constant';
import { useAppDispatch } from 'core/hooks/useAppDispatch';
import { useAppSelector } from 'core/hooks/useAppSelector';
import { useModal } from 'core/hooks/useModal';
import { useMutUpdateGho } from 'core/services/hooks/mutations/checklist/useMutUpdateGho';

import { ModalEnum } from '../../../../../../../../../core/enums/modal.enums';
import { useHierarchyTreeActions } from '../../../../../../../../../core/hooks/useHierarchyTreeActions';
import { STagButton } from '../../../../../../../../atoms/STagButton';
import SText from '../../../../../../../../atoms/SText';
import { TreeTypeEnum } from '../../../../enums/tree-type.enums';
import { ITreeMapObject, ITreeSelectedItem } from '../../../../interfaces';
import { OptionsHelpSelect } from '../../../Selects/OptionsHelpSelect';
import { TypeSelect } from '../../../Selects/TypeSelect';
import { GhoSelectCard } from './Select/ghoSelect';
import { STSelectBox } from './styles';
import { INodeCardProps } from './types';

export function onVisible(callback: any) {
  return new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        callback(false);
      } else {
        callback(true);
      }
    });
  });
}

const NodeLabel: FC<{ label: string; type: TreeTypeEnum; hide: boolean }> = ({
  label,
}) => {
  return (
    <STooltip minLength={25} withWrapper enterDelay={600} title={label}>
      <SText
        sx={{
          pr: 10,
          width: '100%',
          fontSize: 13,
          lineHeight: '15px',
          pb: '1px',
        }}
        lineNumber={2}
      >
        {label}
      </SText>
    </STooltip>
  );
};

const SelectGho: FC<{
  isSelectedGho: boolean;
  isLoading: boolean;
  hide: boolean;
  handleAddGhoHierarchy: any;
  node: ITreeMapObject;
}> = ({ isSelectedGho, handleAddGhoHierarchy, node }) => {
  // const [open, setOpen] = useState(false);
  const ref = useRef<HTMLElement>(null);

  // function checkVisible() {
  //   if (ref.current) {
  //     const rect = ref.current.getBoundingClientRect();
  //     const viewHeight = Math.max(
  //       document.documentElement.clientHeight,
  //       window.innerHeight,
  //     );
  //     return !(rect.bottom < 0 || rect.top - viewHeight >= 0);
  //   }
  // }

  // useEffect(() => {
  //   const isVisible = checkVisible();

  //   if (isVisible) {
  //     setOpen(true);

  //     const timeout = window.setTimeout(() => {
  //       setOpen(false);
  //     }, 5000);

  //     return () => {
  //       window.clearTimeout(timeout);
  //     };
  //   }
  // }, []);

  const onSelect = (e: MouseEvent<HTMLDivElement>) => {
    handleAddGhoHierarchy(e);
  };

  return (
    <STooltip
      title={`Click aqui para incluir o ${node.label.slice(0, 8)}${
        node.label.length > 9 ? '...' : ''
      } ao GSE`}
    >
      <STSelectBox
        ref={ref}
        selected={isSelectedGho ? 1 : 0}
        onClick={onSelect}
      />
    </STooltip>
  );

  // return (
  //   <STooltip
  //     PopperProps={{ open }}
  //     title={`Click aqui para incluir o ${node.label.slice(0, 8)}${
  //       node.label.length > 9 ? '...' : ''
  //     } ao GSE`}
  //   >
  //     <STSelectBox
  //       ref={ref}
  //       selected={isSelectedGho ? 1 : 0}
  //       onClick={onSelect}
  //     />
  //   </STooltip>
  // );
};

export const NodeCard: FC<INodeCardProps> = ({
  handleClickCard,
  node,
  menuRef,
}) => {
  const { onOpenModal } = useModal();
  const updateMutation = useMutUpdateGho();
  const { editNodes, createEmptyCard, getPathById, isChild, getChildren } =
    useHierarchyTreeActions();
  const isSelectedGho = useAppSelector(
    selectGhoHierarchy(getPathById(node.id) as string[]),
  );
  const GhoId = useAppSelector(selectGhoId);
  const store = useStore();
  const dispatch = useAppDispatch();
  const ref = useRef<HTMLDivElement>(null);
  const [hide, setHide] = useState(true);

  const handleAddCard = (e: MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();

    createEmptyCard(node.id);
    onOpenModal(ModalEnum.HIERARCHY_TREE_CARD);
  };

  const onUpdateGho = (newHierarchyIds: string[]) => {
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

    const ghoState = store.getState().gho as IGhoState;
    let newHierarchyIds = [...ghoState.hierarchies];

    // eslint-disable-next-line prettier/prettier
    const isToRemove = ghoState.hierarchies.some((hierarchyId) => hierarchyId === node.id);
    // eslint-disable-next-line prettier/prettier
    if (isToRemove) newHierarchyIds = newHierarchyIds.filter((hierarchyId) => hierarchyId !== node.id);
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

      //remove parents
      newHierarchyIds = newHierarchyIds.filter(
        (hierarchyId) => ![node.id, ...nodePath].includes(String(hierarchyId)),
      );

      onUpdateGho(newHierarchyIds);
    }
  };

  useEffect(() => {
    if (ref.current) {
      const x = onVisible((e: boolean) => setHide(e));
      x.observe(ref.current);

      return () => {
        x.disconnect();
      };
    }
  }, []);

  return (
    <div style={{ display: 'inline-block' }} ref={ref}>
      <Box
        sx={{ display: 'flex', justifyContent: 'space-between' }}
        onClick={GhoId ? handleAddGhoHierarchy : () => null}
      >
        <SFlex center>
          {!hide &&
            GhoId &&
            ![TreeTypeEnum.COMPANY, TreeTypeEnum.WORKSPACE].includes(
              node.type,
            ) && (
              <SelectGho
                isSelectedGho={isSelectedGho}
                handleAddGhoHierarchy={handleAddGhoHierarchy}
                node={node}
                hide={hide}
                isLoading={!!updateMutation.isLoading}
              />
            )}
          <NodeLabel hide={hide} label={node.label} type={node.type} />
        </SFlex>
        <SFlex>
          {!GhoId &&
            ![TreeTypeEnum.COMPANY, TreeTypeEnum.SUB_OFFICE].includes(
              node.type,
            ) && (
              <>
                <STagButton
                  sx={{ pr: 1, pl: 2 }}
                  onClick={handleAddCard}
                  icon={AddIcon}
                />
                {node.type === TreeTypeEnum.WORKSPACE && //! create component for this
                  !node.childrenIds?.length && (
                    <Box
                      sx={{
                        position: 'absolute',
                        right: 'calc(-50% + 10px)',
                        top: 45,
                      }}
                    >
                      <SText
                        sx={{
                          backgroundColor: 'background.paper',
                          px: 8,
                          borderRadius: 1,
                          py: 3,
                          boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.4)',
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
              </>
            )}
        </SFlex>
      </Box>
      {!hide && (
        <>
          <Stack
            onClick={handleAddGhoHierarchy}
            spacing={2}
            mt={3}
            direction="row"
          >
            <TypeSelect
              node={node as ITreeSelectedItem}
              parentId={node?.parentId || 'no-node'}
              handleSelect={(option) =>
                editNodes([{ id: node.id, type: option.value as TreeTypeEnum }])
              }
            />
            {node.ghos && node.ghos.length > 0 && <GhoSelectCard node={node} />}
            {!GhoId && (
              <OptionsHelpSelect
                disabled={!!GhoId}
                menuRef={menuRef}
                node={node}
                onEdit={handleClickCard}
              />
            )}
          </Stack>
        </>
      )}
    </div>
  );
};
