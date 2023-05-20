import React, { FC } from 'react';

import ContactPageIcon from '@mui/icons-material/ContactPage';

import { IIconMuiProps } from 'core/interfaces/IIconMuiProps';

export const SOsIcon: FC<{ children?: any } & IIconMuiProps> = ({
  ...props
}) => {
  return <ContactPageIcon {...props} />;
};

export default ContactPageIcon;
