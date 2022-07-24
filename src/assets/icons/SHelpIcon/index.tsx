import React, { FC } from 'react';

import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

import { IIconMuiProps } from 'core/interfaces/IIconMuiProps';
export const SHelpIcon: FC<IIconMuiProps> = ({ ...props }) => {
  return <HelpOutlineIcon {...props} />;
};

export default HelpOutlineIcon;
