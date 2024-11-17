import { FC } from 'react';

import { IIconProps } from '@v2/types/icon-props.types';
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined';
import ArrowBackIosNewOutlinedIcon from '@mui/icons-material/ArrowBackIosNewOutlined';

export const SIconArrowBack: FC<
  IIconProps & { variant: 'line' | 'simple' }
> = ({ color, fontSize, variant = 'line' }) => {
  if (variant === 'simple') {
    return (
      <ArrowBackIosNewOutlinedIcon
        sx={{
          fontSize: fontSize || 'inherit',
          color: color || 'inherit',
        }}
      />
    );
  }

  return (
    <ArrowBackOutlinedIcon
      sx={{
        fontSize: fontSize || 'inherit',
        color: color || 'inherit',
      }}
    />
  );
};
