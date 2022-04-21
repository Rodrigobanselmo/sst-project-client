import React, { FC } from 'react';

import OpenInFullIcon from '@mui/icons-material/OpenInFull';

import { IIconMuiProps } from 'core/interfaces/IIconMuiProps';

export const SExpandIcon: FC<IIconMuiProps> = ({ ...props }) => {
  return <OpenInFullIcon {...props} />;
};

export default OpenInFullIcon;
