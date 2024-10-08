import React, { FC } from 'react';

import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

import { IIconMuiProps } from 'core/interfaces/IIconMuiProps';
export const SArrowRight: FC<{ children?: any } & IIconMuiProps> = ({
  ...props
}) => {
  return <ArrowForwardIcon {...props} />;
};

export default ArrowForwardIcon;
