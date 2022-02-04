import React from 'react';

import { useAppSelector } from '../../../../../core/hooks/useAppSelector';
import { selectTreeData } from '../../../../../store/reducers/tree/treeSlice';
import { IRender } from '../interfaces';
import { RenderCard } from '../RenderCard';
import { RenderChildren } from '../RenderChildren';
import { OrgTreeNode } from './styles';

export const RenderNode = ({ prop, first, id }: IRender) => {
  const data = useAppSelector(selectTreeData(id));

  if (!data) return null;
  console.log('data', data?.label || data);

  const cls = ['org-tree-node'];

  const { horizontal, collapsable } = prop;

  if (data.childrenIds.length == 0) {
    cls.push('is-leaf');
  } else if (collapsable && !data.expand) {
    cls.push('collapsed');
  }

  if (first) cls.push('org-tree-node-first');

  return (
    <OrgTreeNode
      id={`node-tree-${data.id}`}
      horizontal={horizontal}
      className={cls.join(' ')}
    >
      <RenderCard data={data} prop={prop} />
      {(!collapsable || data.expand) && (
        <RenderChildren nodeId={data.id} list={data.childrenIds} prop={prop} />
      )}
      {data.childrenIds.includes('mock_id') && !data.expand && (
        <RenderChildren
          nodeId={data.id}
          list={data.childrenIds.filter((child) => child === 'mock_id')}
          prop={prop}
        />
      )}
    </OrgTreeNode>
  );
};
