/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';

import { isLastNode } from '..';

import { useModal } from '../../../../../core/contexts/ModalContext';
import { ModalEnum } from '../../../../../core/enums/modal.enums';
import SText from '../../../../atoms/SText';
import { IRenderCard } from '../interfaces';
import { RenderBtn } from '../RenderBtn';
import { useDnd } from './hooks/useDnd';
import { CardArea, RenderLabel } from './styles';

export const RenderCard = ({
  data,
  setExpand,
  expand,
  mock,
  prop,
}: IRenderCard) => {
  const { drop, isDragging, drag } = useDnd(data);
  const { onOpenModal } = useModal();
  console.log(data.id);

  const clx = ['org-tree-node-label-inner'];

  if (mock) {
    clx.push('mock_card');
  }

  return (
    <CardArea
      id={`label_${data.id}`}
      key={`label_${data.id}`}
      horizontal={!!prop.horizontal}
      className={'org-tree-node-label'}
      ref={drop}
      onClick={() => onOpenModal(ModalEnum.TREE_CARD)}
    >
      <RenderLabel
        key={`label_inner_${data.id}`}
        ref={drag}
        isDragging={isDragging}
        className={clx.join(' ')}
        style={{ ...prop.cardStyle, ...data.style }}
      >
        <SText lineNumber={2}>{data.label || '...carregando'}</SText>
        {prop.collapsable && !isLastNode(data, prop) && (
          <RenderBtn
            setExpand={setExpand}
            expand={expand}
            data={data}
            prop={prop}
          />
        )}
      </RenderLabel>
    </CardArea>
  );
};
