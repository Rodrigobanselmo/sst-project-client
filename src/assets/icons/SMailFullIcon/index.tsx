import React, { FC } from 'react';

import EmailIcon from '@mui/icons-material/Email';

import { IIconMuiProps } from 'core/interfaces/IIconMuiProps';

export const SMailFullIcon: FC<IIconMuiProps> = ({ ...props }) => {
  return <EmailIcon {...props} />;
};

export default EmailIcon;
