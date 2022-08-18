import React, { FC } from 'react';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import { IIconMuiProps } from 'core/interfaces/IIconMuiProps';

export const SArrowBackIcon: FC<IIconMuiProps> = ({ ...props }) => {
  return <ArrowBackIcon {...props} />;
};

export default ArrowBackIcon;
