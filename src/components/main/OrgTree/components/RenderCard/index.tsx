/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';

import { isLastNode } from '..';

import { IRenderCard } from '../interfaces';
import { RenderBtn } from '../RenderBtn';
import { TextLabel } from './components/TextLabel';
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
      onClick={(e) =>
        typeof prop.onClick === 'function' && prop.onClick(e, data)
      }
    >
      <RenderLabel
        key={`label_inner_${data.id}`}
        ref={drag}
        isDragging={isDragging}
        className={clx.join(' ')}
        style={{ ...prop.cardStyle, ...data.style }}
      >
        <TextLabel data={data} />
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
