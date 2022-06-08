import React, { FC } from 'react';

import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';

import { IIconMuiProps } from 'core/interfaces/IIconMuiProps';

export const SArrowUpFilterIcon: FC<IIconMuiProps> = ({ ...props }) => {
  return <ArrowDropUpIcon {...props} />;
};

export default ArrowDropUpIcon;
