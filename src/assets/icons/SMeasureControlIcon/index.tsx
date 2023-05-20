import React, { FC } from 'react';

import StraightenIcon from '@mui/icons-material/Straighten';

import { IIconMuiProps } from 'core/interfaces/IIconMuiProps';

export const SMeasureControlIcon: FC<{ children?: any } & IIconMuiProps> = ({
  ...props
}) => {
  return <StraightenIcon {...props} />;
};

export default StraightenIcon;
