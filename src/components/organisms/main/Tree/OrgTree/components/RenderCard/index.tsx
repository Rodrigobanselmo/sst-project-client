import React, { MouseEvent, useRef } from 'react';

import {
  selectHierarchyNodeIsSelected,
  selectHierarchySelectionMode,
  setSelectionMode,
  toggleSelectedNodeId,
} from 'store/reducers/hierarchy/hierarchySlice';

import { useAppDispatch } from 'core/hooks/useAppDispatch';
import { useAppSelector } from 'core/hooks/useAppSelector';
import { useModal } from 'core/hooks/useModal';

import { ModalEnum } from '../../../../../../../core/enums/modal.enums';
import { useHierarchyTreeActions } from '../../../../../../../core/hooks/useHierarchyTreeActions';
import { isHierarchyNodeSelectable } from '../../constants/hierarchy-selection.constant';
import { IRenderCard } from '../interfaces';
import { RenderBtn } from '../RenderBtn';
import { NodeCard } from './components/NodeCard';
import { useDnd } from './hooks/useDnd';
import { STCardArea, STRenderLabel } from './styles';

export const RenderCard = ({ node, prop }: IRenderCard) => {
  const dispatch = useAppDispatch();
  const { setSelectedItem } = useHierarchyTreeActions();
  const { drop, isDragging, drag } = useDnd(node);
  const { onOpenModal } = useModal();
  const menuRef = useRef<HTMLDivElement>(null);
  const selectionMode = useAppSelector(selectHierarchySelectionMode);
  const isSelected = useAppSelector(selectHierarchyNodeIsSelected(node.id));
  const canSelect = isHierarchyNodeSelectable(node);

  const clx = ['org-tree-node-label-inner'];

  if (node.className) clx.push(node.className);

  const handleClickCard = (e?: MouseEvent) => {
    if (node.showRef) return;

    // Shift + clique: inicia o modo de seleção e marca o card (sem abrir modal).
    if (!selectionMode && e?.shiftKey) {
      e.preventDefault();
      e.stopPropagation();
      if (!canSelect) return;
      dispatch(setSelectionMode(true));
      dispatch(toggleSelectedNodeId(String(node.id)));
      return;
    }

    if (selectionMode) {
      if (!canSelect) return;
      dispatch(toggleSelectedNodeId(String(node.id)));
      return;
    }

    onOpenModal(ModalEnum.HIERARCHY_TREE_CARD);
    setSelectedItem(node);
  };

  const onContextMenu = (e: MouseEvent<HTMLDivElement>) => {
    if (selectionMode) {
      e.preventDefault();
      return;
    }
    e.preventDefault();
    if (menuRef.current) menuRef.current.click();
  };

  return (
    <STCardArea
      id={`label_${node.id}`}
      key={`label_${node.id}`}
      horizontal={prop.horizontal ? 1 : 0}
      className={'org-tree-node-label'}
      ref={drop as any}
      sx={selectionMode ? { cursor: 'default' } : undefined}
    >
      <STRenderLabel
        key={`label_inner_${node.id}`}
        id={`node_card_${node.id}`}
        ref={drag as any}
        type={node.type}
        isDragging={isDragging}
        isSelected={isSelected}
        selectionMode={selectionMode}
        className={clx.join(' ')}
        style={{ ...node?.style }}
        onClick={handleClickCard}
        onContextMenu={onContextMenu}
      >
        <NodeCard
          handleClickCard={handleClickCard}
          menuRef={menuRef}
          node={node}
        />
        {prop.collapsable && !!node.childrenIds.length && (
          <RenderBtn prop={prop} node={node} />
        )}
      </STRenderLabel>
    </STCardArea>
  );
};
