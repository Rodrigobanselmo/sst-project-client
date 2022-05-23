import React, { FC } from 'react';

// import EmojiTransportationIcon from '@mui/icons-material/EmojiTransportation';
import StoreTwoToneIcon from '@mui/icons-material/StoreTwoTone';

import { IIconMuiProps } from 'core/interfaces/IIconMuiProps';

export const SWorkspaceIcon: FC<IIconMuiProps> = ({ ...props }) => {
  return <StoreTwoToneIcon {...props} />;
};

export default StoreTwoToneIcon;
