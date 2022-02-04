import React from 'react';

import { useAppDispatch } from '../../../../../core/hooks/useAppDispatch';
import { setEditNodes } from '../../../../../store/reducers/tree/treeSlice';
import { IRenderButton } from '../interfaces';
import { RenderButton } from './styles';

export const RenderBtn = ({ data, prop }: IRenderButton) => {
  const { horizontal } = prop;

  const expand = data.expand;

  const dispatch = useAppDispatch();

  return (
    <RenderButton
      horizontal={!!horizontal}
      expanded={expand}
      onClick={(e) => {
        e.stopPropagation();
        dispatch(
          setEditNodes([
            {
              id: data.id,
              expand: !expand,
            },
          ]),
        );
      }}
    />
  );
};
