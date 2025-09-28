import React, { FC } from 'react';

import WhatsAppIcon from '@mui/icons-material/WhatsApp';

import { IIconMuiProps } from 'core/interfaces/IIconMuiProps';

export const SWhatsAppIcon: FC<{ children?: any } & IIconMuiProps> = ({
  ...props
}) => {
  return <WhatsAppIcon {...props} />;
};

export default WhatsAppIcon;
