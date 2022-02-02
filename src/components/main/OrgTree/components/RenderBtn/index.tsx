import React from 'react';

import { IRenderCard } from '../interfaces';
import { RenderButton } from './styles';

export const RenderBtn = ({ setExpand, expand, prop }: IRenderCard) => {
  const { horizontal } = prop;

  return (
    <RenderButton
      buttonBorderColor={prop.buttonBorderColor || ''}
      buttonBackgroundColor={prop.buttonBackgroundColor || ''}
      horizontal={!!horizontal}
      expanded={expand}
      onClick={(e) => {
        e.stopPropagation();
        setExpand(!expand);
      }}
    />
  );
};
