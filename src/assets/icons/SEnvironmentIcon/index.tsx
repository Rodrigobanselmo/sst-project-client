import React, { FC } from 'react';

import AttributionIcon from '@mui/icons-material/Attribution';

import { IIconMuiProps } from 'core/interfaces/IIconMuiProps';

export const SEnvironmentIcon: FC<IIconMuiProps> = ({ ...props }) => {
  return <AttributionIcon {...props} />;
};

export default AttributionIcon;
