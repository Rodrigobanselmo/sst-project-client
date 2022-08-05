import React, { FC } from 'react';

import LocalHospitalIcon from '@mui/icons-material/LocalHospital';

import { IIconMuiProps } from 'core/interfaces/IIconMuiProps';

export const SClinicIcon: FC<IIconMuiProps> = ({ ...props }) => {
  return <LocalHospitalIcon {...props} />;
};

export default LocalHospitalIcon;
