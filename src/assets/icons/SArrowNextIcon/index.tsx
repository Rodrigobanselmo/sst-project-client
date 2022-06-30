import React, { FC } from 'react';

import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

import { IIconMuiProps } from 'core/interfaces/IIconMuiProps';

export const SArrowNextIcon: FC<IIconMuiProps> = ({ ...props }) => {
  return <ArrowForwardIosIcon {...props} />;
};

export default ArrowForwardIosIcon;
