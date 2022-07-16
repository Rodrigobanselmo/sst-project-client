import React, { FC } from 'react';

import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';

import { IIconMuiProps } from 'core/interfaces/IIconMuiProps';

export const SOrderIcon: FC<IIconMuiProps> = ({ ...props }) => {
  return <FormatListNumberedIcon {...props} />;
};

export default FormatListNumberedIcon;
