import React, { FC } from 'react';

import ReportProblemOutlinedIcon from '@mui/icons-material/ReportProblemOutlined';

import { IIconMuiProps } from 'core/interfaces/IIconMuiProps';

export const SRiskFactorIcon: FC<IIconMuiProps> = ({ ...props }) => {
  return <ReportProblemOutlinedIcon {...props} />;
};

export default ReportProblemOutlinedIcon;
