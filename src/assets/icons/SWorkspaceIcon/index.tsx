import React, { FC } from 'react';

import EmojiTransportationIcon from '@mui/icons-material/EmojiTransportation';

import { IIconMuiProps } from 'core/interfaces/IIconMuiProps';

export const SWorkspaceIcon: FC<IIconMuiProps> = ({ ...props }) => {
  return <EmojiTransportationIcon {...props} />;
};

export default EmojiTransportationIcon;
