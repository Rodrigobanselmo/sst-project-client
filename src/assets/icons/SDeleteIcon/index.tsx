import React, { FC } from 'react';

import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

import { IIconMuiProps } from 'core/interfaces/IIconMuiProps';

export const SDeleteIcon: FC<IIconMuiProps> = ({ ...props }) => {
  return <DeleteOutlineIcon {...props} />;
};

export default DeleteOutlineIcon;
