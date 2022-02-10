import React, { useRef, MouseEvent } from 'react';

import { useModal } from 'core/hooks/useModal';

import { ModalEnum } from '../../../../../core/enums/modal.enums';
import { useTreeActions } from '../../../../../core/hooks/useTreeActions';
import { IRenderCard } from '../interfaces';
import { RenderBtn } from '../RenderBtn';
import { NodeCard } from './components/NodeCard';
import { useDnd } from './hooks/useDnd';
import { STCardArea, STRenderLabel } from './styles';

export const RenderCard = ({ node, prop }: IRenderCard) => {
  const { setSelectedItem } = useTreeActions();
  const { drop, isDragging, drag } = useDnd(node);
  const { onOpenModal } = useModal();
  const menuRef = useRef<HTMLDivElement>(null);

  const clx = ['org-tree-node-label-inner'];

  if (node.className) clx.push(node.className);

  const handleClickCard = () => {
    onOpenModal(ModalEnum.TREE_CARD);
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
        ref={drag}
        type={node.type}
        isDragging={isDragging}
        className={clx.join(' ')}
        style={{ ...node?.style }}
        onClick={handleClickCard}
        onContextMenu={onContextMenu}
      >
        <NodeCard menuRef={menuRef} node={node} />
        {prop.collapsable && !!node.childrenIds.length && (
          <RenderBtn prop={prop} node={node} />
        )}
      </STRenderLabel>
    </STCardArea>
  );
};
