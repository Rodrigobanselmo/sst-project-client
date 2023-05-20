import React, { FC } from 'react';

import CampaignIcon from '@mui/icons-material/Campaign';

import { IIconMuiProps } from 'core/interfaces/IIconMuiProps';

export const SAlertIcon: FC<{ children?: any } & IIconMuiProps> = ({
  ...props
}) => {
  return <CampaignIcon {...props} />;
};

export default CampaignIcon;
