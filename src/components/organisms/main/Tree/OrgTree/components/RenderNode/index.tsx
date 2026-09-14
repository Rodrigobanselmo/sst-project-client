import React from 'react';

import { selectHierarchyTreeData } from 'store/reducers/hierarchy/hierarchySlice';

import { useAppSelector } from '../../../../../../../core/hooks/useAppSelector';
import { ITreeMapObject } from '../../interfaces';
import {
  canExpandOrgNode,
  hasOrgEmployeeLeaves,
} from '../../utils/get-org-employee-leaves';
import { EmployeeTreeLeaves } from '../EmployeeTreeLeaves';
import { IRender } from '../interfaces';
import { RenderCard } from '../RenderCard';
import { RenderChildren } from '../RenderChildren';
import { OrgTreeNode } from './styles';

export const RenderNode = ({ prop, first, id }: IRender) => {
  const node = useAppSelector(
    selectHierarchyTreeData(id),
  ) as unknown as ITreeMapObject | null;

  if (!node) return null;
  if (node.hide) return null;

  const expanded = node.expand || node.searchExpand;

  const cls = ['org-tree-node'];

  const { horizontal, collapsable } = prop;
  const canExpand = canExpandOrgNode(node);
  const showEmployeeLeaves = hasOrgEmployeeLeaves(node);

  if (!canExpand) {
    cls.push('is-leaf');
  } else if (collapsable && !expanded) {
    cls.push('collapsed');
  }

  if (first) cls.push('org-tree-node-first');

  return (
    <OrgTreeNode
      id={`node-tree-${node.id}`}
      horizontal={horizontal ? 1 : 0}
      className={cls.join(' ')}
    >
      <RenderCard node={node} prop={prop} />
      {(!collapsable || expanded) && (
        <RenderChildren
          nodeId={node.id}
          list={node.childrenIds}
          prop={prop}
          extra={
            showEmployeeLeaves ? (
              <EmployeeTreeLeaves node={node} horizontal={horizontal} />
            ) : null
          }
        />
      )}
      {node.childrenIds.includes('mock_id') && !expanded && (
        <RenderChildren
          nodeId={node.id}
          list={node.childrenIds.filter((child) => child === 'mock_id')}
          prop={prop}
        />
      )}
    </OrgTreeNode>
  );
};
