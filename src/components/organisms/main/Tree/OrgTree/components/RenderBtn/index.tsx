import React from 'react';

import { useAppSelector } from 'core/hooks/useAppSelector';
import { useHierarchyTreeActions } from 'core/hooks/useHierarchyTreeActions';

import { useAppDispatch } from '../../../../../../../core/hooks/useAppDispatch';
import {
  selectWorkplaceId,
  setEditNodes,
} from '../../../../../../../store/reducers/hierarchy/hierarchySlice';
import { TreeTypeEnum } from '../../enums/tree-type.enums';
import { IRenderButton } from '../interfaces';
import { RenderButton } from './styles';

export const RenderBtn = ({ node, prop }: IRenderButton) => {
  const { horizontal } = prop;

  const expand = node.expand;
  const workspaceId = useAppSelector(selectWorkplaceId);

  const dispatch = useAppDispatch();
  const isWorkspace = node.type === TreeTypeEnum.WORKSPACE;
  const { editWorkspaceNodes } = useHierarchyTreeActions();

  return (
    <RenderButton
      workspace={isWorkspace ? 1 : 0}
      seed={node.type === TreeTypeEnum.COMPANY ? 1 : 0}
      horizontal={horizontal ? 1 : 0}
      expanded={(isWorkspace ? workspaceId === node.id : expand) ? 1 : 0}
      onClick={(e) => {
        e.stopPropagation();

        if (isWorkspace) {
          return editWorkspaceNodes(node.id as string);
        }

        dispatch(
          setEditNodes([
            {
              id: node.id,
              expand: !expand,
            },
          ]),
        );
      }}
    />
  );
};
