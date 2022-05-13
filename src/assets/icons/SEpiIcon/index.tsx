import React, { FC } from 'react';

import SecurityOutlinedIcon from '@mui/icons-material/SecurityOutlined';

import { IIconMuiProps } from 'core/interfaces/IIconMuiProps';

export const SEpiIcon: FC<IIconMuiProps> = ({ ...props }) => {
  return <SecurityOutlinedIcon {...props} />;
};

export default SecurityOutlinedIcon;