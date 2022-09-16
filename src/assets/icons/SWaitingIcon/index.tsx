import React, { FC } from 'react';

import HourglassTopIcon from '@mui/icons-material/HourglassTop';

import { IIconMuiProps } from 'core/interfaces/IIconMuiProps';

export const SWaitingIcon: FC<IIconMuiProps & any> = ({ ...props }) => {
  return <HourglassTopIcon {...props} />;
};

export default HourglassTopIcon;
