import React, { FC } from 'react';

import AssessmentIcon from '@mui/icons-material/Assessment';

import { IIconMuiProps } from 'core/interfaces/IIconMuiProps';

export const SReportIcon: FC<IIconMuiProps> = ({ ...props }) => {
  return <AssessmentIcon {...props} />;
};

export default AssessmentIcon;
