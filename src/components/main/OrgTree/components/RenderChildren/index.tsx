import React from 'react';

import { IRenderChildren } from '../interfaces';
import { RenderNode } from '../RenderNode';
import { ChildrenComponent } from './styles';

export const RenderChildren = ({ data, prop, list }: IRenderChildren) => {
  if (Array.isArray(list) && list.length) {
    return (
      <ChildrenComponent
        id={`children_${data.id}`}
        className={'org-tree-node-children'}
        horizontal={!!prop.horizontal}
      >
        {list.map((childId) => {
          return <RenderNode key={childId} id={childId} prop={prop} />;
        })}
      </ChildrenComponent>
    );
  }
  return null;
};
