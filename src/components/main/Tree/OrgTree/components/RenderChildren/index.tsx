import React, { memo } from 'react';

import { IRenderChildren } from '../interfaces';
import { RenderNode } from '../RenderNode';
import { ChildrenComponent } from './styles';

const RenderChildrenNodes = ({ nodeId, prop, list }: IRenderChildren) => {
  if (Array.isArray(list) && list.length) {
    return (
      <ChildrenComponent
        id={`children_${nodeId}`}
        className={'org-tree-node-children'}
        horizontal={prop.horizontal ? 1 : 0}
      >
        {list.map((childId) => {
          return <RenderNode key={childId} id={childId} prop={prop} />;
        })}
      </ChildrenComponent>
    );
  }
  return null;
};

export const RenderChildren = memo(RenderChildrenNodes);
