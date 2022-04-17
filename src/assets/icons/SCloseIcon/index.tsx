import React, { FC } from 'react';

import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';

import { IIconMuiProps } from 'core/interfaces/IIconMuiProps';

export const SCloseIcon: FC<IIconMuiProps> = ({ ...props }) => {
  return <CloseOutlinedIcon {...props} />;
};

export default CloseOutlinedIcon;
