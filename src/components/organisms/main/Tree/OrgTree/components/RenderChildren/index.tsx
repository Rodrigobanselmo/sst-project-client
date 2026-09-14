import React, { memo } from 'react';

import { IRenderChildren } from '../interfaces';
import { RenderNode } from '../RenderNode';
import { ChildrenComponent } from './styles';

const RenderChildrenNodes = ({ nodeId, prop, list, extra }: IRenderChildren) => {
  const hasStructuralChildren = Array.isArray(list) && list.length > 0;
  if (!hasStructuralChildren && !extra) {
    return null;
  }

  return (
    <ChildrenComponent
      id={`children_${nodeId}`}
      className={'org-tree-node-children'}
      horizontal={prop.horizontal ? 1 : 0}
    >
      {hasStructuralChildren
        ? list.map((childId) => {
            return <RenderNode key={childId} id={childId} prop={prop} />;
          })
        : null}
      {extra}
    </ChildrenComponent>
  );
};

export const RenderChildren = memo(RenderChildrenNodes);
