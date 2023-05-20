import React, { FC } from 'react';

import EngineeringIcon from '@mui/icons-material/Engineering';

import { IIconMuiProps } from 'core/interfaces/IIconMuiProps';

export const SCharacterizationIcon: FC<{ children?: any } & IIconMuiProps> = ({
  ...props
}) => {
  return <EngineeringIcon {...props} />;
};

export default EngineeringIcon;
