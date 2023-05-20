import React, { FC } from 'react';

import RotateRightIcon from '@mui/icons-material/RotateRight';

import { IIconMuiProps } from 'core/interfaces/IIconMuiProps';

export const SRotateRightIcon: FC<{ children?: any } & IIconMuiProps> = ({
  ...props
}) => {
  return <RotateRightIcon {...props} />;
};

export default RotateRightIcon;
