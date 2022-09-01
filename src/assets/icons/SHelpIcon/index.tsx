import React, { FC } from 'react';

import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { IconProps } from '@mui/material';

import { IIconMuiProps } from 'core/interfaces/IIconMuiProps';

export const SHelpIcon: FC<IIconMuiProps & Partial<IconProps>> = ({
  ...props
}) => {
  return <HelpOutlineIcon {...(props as any)} />;
};

export default HelpOutlineIcon;
