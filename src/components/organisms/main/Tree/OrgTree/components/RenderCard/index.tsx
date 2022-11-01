import React, { MouseEvent, useRef } from 'react';
import { useStore } from 'react-redux';

import { IGhoState } from 'store/reducers/hierarchy/ghoSlice';

import { useModal } from 'core/hooks/useModal';

import { ModalEnum } from '../../../../../../../core/enums/modal.enums';
import { useHierarchyTreeActions } from '../../../../../../../core/hooks/useHierarchyTreeActions';
import { IRenderCard } from '../interfaces';
import { RenderBtn } from '../RenderBtn';
import { NodeCard } from './components/NodeCard';
import { useDnd } from './hooks/useDnd';
import { STCardArea, STRenderLabel } from './styles';

export const RenderCard = ({ node, prop }: IRenderCard) => {
  const { setSelectedItem } = useHierarchyTreeActions();
  const { drop, isDragging, drag } = useDnd(node);
  const { onOpenModal } = useModal();
  const menuRef = useRef<HTMLDivElement>(null);
  // const store = useStore();

  const clx = ['org-tree-node-label-inner'];

  if (node.className) clx.push(node.className);

  const handleClickCard = () => {
    if (node.showRef) return;

    // const ghoState = store.getState().gho as IGhoState;
    // if (ghoState.open) return null;
    onOpenModal(ModalEnum.HIERARCHY_TREE_CARD);
    setSelectedItem(node);
  };

  const onContextMenu = (e: MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (menuRef.current) menuRef.current.click();
  };

  return (
    <STCardArea
      id={`label_${node.id}`}
      key={`label_${node.id}`}
      horizontal={prop.horizontal ? 1 : 0}
      className={'org-tree-node-label'}
      ref={drop}
    >
      <STRenderLabel
        key={`label_inner_${node.id}`}
        id={`node_card_${node.id}`}
        ref={drag}
        type={node.type}
        isDragging={isDragging}
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
