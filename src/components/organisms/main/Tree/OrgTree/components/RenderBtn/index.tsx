import React from 'react';

import {
  IGhoState,
  selectGhoHierarchy,
  selectGhoId,
  selectGhoOpen,
  setGhoAddHierarchy,
  setGhoState,
} from 'store/reducers/hierarchy/ghoSlice';

import { useAppSelector } from 'core/hooks/useAppSelector';
import { useHierarchyTreeActions } from 'core/hooks/useHierarchyTreeActions';

import { useAppDispatch } from '../../../../../../../core/hooks/useAppDispatch';
import { setEditNodes } from '../../../../../../../store/reducers/hierarchy/hierarchySlice';
import { TreeTypeEnum } from '../../enums/tree-type.enums';
import { IRenderButton } from '../interfaces';
import { RenderButton } from './styles';

export const RenderBtn = ({ node, prop }: IRenderButton) => {
  const { horizontal } = prop;

  const { getChildren } = useHierarchyTreeActions();

  const expand = node.expand;

  const isSelectedGho = useAppSelector(
    selectGhoHierarchy(
      expand
        ? []
        : (Object.values(getChildren(node.id)).map(
            (item) => item.id,
          ) as string[]),
    ),
  );

  const dispatch = useAppDispatch();

  return (
    <RenderButton
      seed={node.type === TreeTypeEnum.COMPANY ? 1 : 0}
      horizontal={horizontal ? 1 : 0}
      selected_gho={isSelectedGho ? 1 : 0}
      expanded={expand ? 1 : 0}
      onClick={(e) => {
        e.stopPropagation();

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
