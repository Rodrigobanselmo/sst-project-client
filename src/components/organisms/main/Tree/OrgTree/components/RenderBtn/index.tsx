import React from 'react';

import { useAppDispatch } from '../../../../../../../core/hooks/useAppDispatch';
import { setEditNodes } from '../../../../../../../store/reducers/hierarchy/hierarchySlice';
import { TreeTypeEnum } from '../../enums/tree-type.enums';
import { IRenderButton } from '../interfaces';
import { RenderButton } from './styles';

export const RenderBtn = ({ node, prop }: IRenderButton) => {
  const { horizontal } = prop;

  const expand = node.expand;

  const dispatch = useAppDispatch();

  return (
    <RenderButton
      seed={node.type === TreeTypeEnum.COMPANY ? 1 : 0}
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
