import React, { useEffect, useState } from 'react';

import { isLastNode } from '..';

import { IRender } from '../interfaces';
import { RenderCard } from '../RenderCard';
import { RenderChildren } from '../RenderChildren';
import { OrgTreeNode } from './styles';

export const RenderNode = ({ data, prop, first, mock }: IRender) => {
  const cls = ['org-tree-node'];
  const { node, expandAll, horizontal, strokeColor, strokeWidth, collapsable } =
    prop;

  const initialExpand =
    expandAll !== null
      ? expandAll
      : !!data && node.expand in data && !!data[node.expand];

  const [expand, setExpand] = useState(
    data.id === 'mock' ? true : initialExpand,
  );

  useEffect(() => {
    if (expandAll !== null) setExpand(data.id === 'mock' ? true : expandAll);
  }, [expandAll, data.id]);

  if (isLastNode(data, prop)) {
    cls.push('is-leaf');
  } else if (collapsable && !expand) {
    cls.push('collapsed');
  }

  if (first) cls.push('org-tree-node-first');

  return (
    <OrgTreeNode
      id={`node-tree-${data.id}`}
      horizontal={horizontal}
      className={cls.join(' ')}
      strokeColor={strokeColor}
      strokeWidth={strokeWidth}
      style={data.id === 'mock' ? { display: 'none' } : {}}
    >
      <RenderCard
        setExpand={setExpand}
        expand={expand}
        data={data}
        prop={prop}
        mock={mock}
      />
      {(!collapsable || expand) && (
        <RenderChildren
          data={data}
          list={data.children}
          prop={prop}
          mock={mock}
        />
      )}
    </OrgTreeNode>
  );
};
