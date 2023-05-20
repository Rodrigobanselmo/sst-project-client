import React, { FC } from 'react';

import LibraryAddCheckOutlinedIcon from '@mui/icons-material/LibraryAddCheckOutlined';

import { IIconMuiProps } from 'core/interfaces/IIconMuiProps';

export const SCheckboxIcon: FC<{ children?: any } & IIconMuiProps> = ({
  ...props
}) => {
  return <LibraryAddCheckOutlinedIcon {...props} />;
};

export default LibraryAddCheckOutlinedIcon;
