import React, { FC } from 'react';

import ContentCopyIcon from '@mui/icons-material/ContentCopy';

import { IIconMuiProps } from 'core/interfaces/IIconMuiProps';

export const SCopyIcon: FC<IIconMuiProps> = ({ ...props }) => {
  return <ContentCopyIcon {...props} />;
};

export default ContentCopyIcon;
