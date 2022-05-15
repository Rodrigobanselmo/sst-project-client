import React from 'react';

import { useAppDispatch } from '../../../../../../../core/hooks/useAppDispatch';
import { setEditNodes } from '../../../../../../../store/reducers/tree/treeSlice';
import { IRenderButton } from '../interfaces';
import { RenderButton } from './styles';

export const RenderBtn = ({ node, prop }: IRenderButton) => {
  const { horizontal } = prop;

  const expand = node.expand;

  const dispatch = useAppDispatch();

  return (
    <RenderButton
      horizontal={horizontal ? 1 : 0}
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
