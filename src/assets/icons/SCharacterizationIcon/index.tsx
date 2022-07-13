import React, { FC } from 'react';

import EngineeringIcon from '@mui/icons-material/Engineering';

import { IIconMuiProps } from 'core/interfaces/IIconMuiProps';

export const SCharacterizationIcon: FC<IIconMuiProps> = ({ ...props }) => {
  return <EngineeringIcon {...props} />;
};

export default EngineeringIcon;