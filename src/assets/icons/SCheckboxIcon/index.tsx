import React, { FC } from 'react';

import IndeterminateCheckBoxOutlinedIcon from '@mui/icons-material/IndeterminateCheckBoxOutlined';

import { IIconMuiProps } from 'core/interfaces/IIconMuiProps';

export const SUncheckBoxIcon: FC<IIconMuiProps> = ({ ...props }) => {
  return <IndeterminateCheckBoxOutlinedIcon {...props} />;
};

export default IndeterminateCheckBoxOutlinedIcon;
