import React, { FC } from 'react';

import PersonIcon from '@mui/icons-material/Person';

import { IIconMuiProps } from 'core/interfaces/IIconMuiProps';

export const SProfileIcon: FC<IIconMuiProps> = ({ ...props }) => {
  return <PersonIcon {...props} />;
};

export default SProfileIcon;
