import React, { FC } from 'react';

import CancelIcon from '@mui/icons-material/Cancel';

import { IIconMuiProps } from 'core/interfaces/IIconMuiProps';

export const SCancelIcon: FC<IIconMuiProps & any> = ({ ...props }) => {
  return <CancelIcon {...props} />;
};

export default CancelIcon;
