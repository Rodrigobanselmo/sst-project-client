import React, { FC } from 'react';

import LinkIcon from '@mui/icons-material/Link';

import { IIconMuiProps } from 'core/interfaces/IIconMuiProps';

export const SLinkIcon: FC<{ children?: any } & IIconMuiProps> = ({
  ...props
}) => {
  return <LinkIcon {...props} />;
};

export default LinkIcon;
