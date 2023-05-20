import React, { FC } from 'react';

import LocalHospitalIcon from '@mui/icons-material/LocalHospital';

import { IIconMuiProps } from 'core/interfaces/IIconMuiProps';

export const SClinicIcon: FC<{ children?: any } & IIconMuiProps> = ({
  ...props
}) => {
  return <LocalHospitalIcon {...props} />;
};

export default LocalHospitalIcon;
