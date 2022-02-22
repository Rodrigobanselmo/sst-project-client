import React, { FC } from 'react';

import EditIcon from '@mui/icons-material/Edit';

import { IIconMuiProps } from 'core/interfaces/IIconMuiProps';

export const SEditIcon: FC<IIconMuiProps> = ({ ...props }) => {
  return <EditIcon {...props} />;
};

export default EditIcon;
