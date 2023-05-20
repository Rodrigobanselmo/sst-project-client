import React, { FC } from 'react';

import ReportProblemOutlinedIcon from '@mui/icons-material/ReportProblemOutlined';
import SickIcon from '@mui/icons-material/Sick';

import { IIconMuiProps } from 'core/interfaces/IIconMuiProps';

export const SAbsenteeismIcon: FC<{ children?: any } & IIconMuiProps> = ({
  ...props
}) => {
  return <SickIcon {...props} />;
};

export default SickIcon;
