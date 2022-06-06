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
  selectGhoOpen,
  setGhoAddHierarchy,
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
import { GhoSelect } from '../../../Selects/GhoSelect';
import { OptionsHelpSelect } from '../../../Selects/OptionsHelpSelect';
import { TypeSelect } from '../../../Selects/TypeSelect';
import { STSelectBox } from './styles';
import { INodeCardProps } from './types';

const NodeLabel: FC<{ label: string; type: TreeTypeEnum }> = ({ label }) => {
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
  handleAddGhoHierarchy: any;
  node: ITreeMapObject;
}> = ({ isSelectedGho, handleAddGhoHierarchy, node }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLElement>(null);

  function checkVisible() {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      const viewHeight = Math.max(
        document.documentElement.clientHeight,
        window.innerHeight,
      );
      return !(rect.bottom < 0 || rect.top - viewHeight >= 0);
    }
  }

  useEffect(() => {
    const isVisible = checkVisible();

    if (isVisible) {
      setOpen(true);

      const timeout = window.setTimeout(() => {
        setOpen(false);
      }, 5000);

      return () => {
        window.clearTimeout(timeout);
      };
    }
  }, []);

  const onSelect = (e: MouseEvent<HTMLDivElement>) => {
    handleAddGhoHierarchy(e);
  };

  return (
    <STooltip
      PopperProps={{ open }}
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
};

export const NodeCard: FC<INodeCardProps> = ({ node, menuRef }) => {
  const { onOpenModal } = useModal();
  const updateMutation = useMutUpdateGho();
  const { editNodes, createEmptyCard, getPathById, isChild } =
    useHierarchyTreeActions();
  const isSelectedGho = useAppSelector(
    selectGhoHierarchy(getPathById(node.id) as string[]),
  );
  const GhoId = useAppSelector(selectGhoId);
  const isGhoOpen = useAppSelector(selectGhoOpen);
  const store = useStore();
  const dispatch = useAppDispatch();

  const handleAddCard = (e: MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();

    createEmptyCard(node.id);
    onOpenModal(ModalEnum.HIERARCHY_TREE_CARD);
  };

  const handleAddGhoHierarchy = (e: MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    const ghoState = store.getState().gho as IGhoState;
    const isParentSelected = getPathById(node.id)
      .slice(0, -1)
      .some((hierarchy) => ghoState.hierarchies.includes(hierarchy as string));
    if (!isParentSelected && node.id && node.parentId !== firstNodeId) {
      const newHierarchyIds = [node.id as string];

      ghoState.hierarchies.map((hierarchy) => {
        if (node.id !== hierarchy && isChild(node.id, hierarchy))
          newHierarchyIds.push(hierarchy);
      });
      dispatch(setGhoAddHierarchy(newHierarchyIds));

      const newGhoState = store.getState().gho as IGhoState;

      if (GhoId)
        updateMutation.mutate({
          id: GhoId,
          hierarchies: newGhoState.hierarchies.map((hierarchy) => ({
            id: hierarchy.split('//')[0],
            workspaceId: hierarchy.split('//')[1],
          })),
        });
    }
  };

  return (
    <>
      <Box
        sx={{ display: 'flex', justifyContent: 'space-between' }}
        onClick={GhoId ? handleAddGhoHierarchy : () => null}
      >
        <SFlex center>
          {GhoId &&
            ![TreeTypeEnum.COMPANY, TreeTypeEnum.WORKSPACE].includes(
              node.type,
            ) && (
              <SelectGho
                isSelectedGho={isSelectedGho}
                handleAddGhoHierarchy={handleAddGhoHierarchy}
                node={node}
              />
            )}
          <NodeLabel label={node.label} type={node.type} />
        </SFlex>
        <SFlex>
          {![TreeTypeEnum.COMPANY, TreeTypeEnum.SUB_OFFICE].includes(
            node.type,
          ) && (
            <STagButton
              sx={{ pr: 1, pl: 2 }}
              onClick={handleAddCard}
              icon={AddIcon}
            />
          )}
        </SFlex>
      </Box>
      <Stack onClick={handleAddGhoHierarchy} spacing={2} mt={3} direction="row">
        <TypeSelect
          node={node as ITreeSelectedItem}
          parentId={node?.parentId || 'no-node'}
          handleSelect={(option) =>
            editNodes([{ id: node.id, type: option.value as TreeTypeEnum }])
          }
        />
        {node.ghos && node.ghos.length > 0 && (
          <GhoSelect node={node} showAll={!!isGhoOpen} />
        )}
        <OptionsHelpSelect disabled={!!GhoId} menuRef={menuRef} node={node} />
      </Stack>
    </>
  );
};
