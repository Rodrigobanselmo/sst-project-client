import React, { FC } from 'react';

import CheckIcon from '@mui/icons-material/Check';

import { IIconMuiProps } from 'core/interfaces/IIconMuiProps';

export const SCheckIcon: FC<IIconMuiProps> = ({ ...props }) => {
  return <CheckIcon {...props} />;
};

export default CheckIcon;
