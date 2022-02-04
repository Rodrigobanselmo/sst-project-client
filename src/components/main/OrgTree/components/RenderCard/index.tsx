/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';

import { useModal } from '../../../../../core/contexts/ModalContext';
import { ModalEnum } from '../../../../../core/enums/modal.enums';
import SText from '../../../../atoms/SText';
import { IRenderCard } from '../interfaces';
import { RenderBtn } from '../RenderBtn';
import { useDnd } from './hooks/useDnd';
import { CardArea, RenderLabel } from './styles';

export const RenderCard = ({ data, prop }: IRenderCard) => {
  const { drop, isDragging, drag } = useDnd(data);
  const { onOpenModal } = useModal();

  const clx = ['org-tree-node-label-inner'];

  if (data.className) clx.push(data.className);

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
        style={{ ...data?.style }}
      >
        <SText lineNumber={2}>{data.label || '...carregando'}</SText>
        {prop.collapsable && !!data.childrenIds.length && (
          <RenderBtn prop={prop} data={data} />
        )}
      </RenderLabel>
    </CardArea>
  );
};
