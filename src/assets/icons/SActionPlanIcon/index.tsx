import React, { FC } from 'react';

import PendingActionsIcon from '@mui/icons-material/PendingActions';

import { IIconMuiProps } from 'core/interfaces/IIconMuiProps';

export const SActionPlanIcon: FC<IIconMuiProps> = ({ ...props }) => {
  return <PendingActionsIcon {...props} />;
};

export default PendingActionsIcon;
