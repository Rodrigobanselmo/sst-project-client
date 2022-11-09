import React, { FC } from 'react';

import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';

import { IIconMuiProps } from 'core/interfaces/IIconMuiProps';

export const SEventIcon: FC<IIconMuiProps> = ({ ...props }) => {
  return <ReceiptLongIcon {...props} />;
};

export default ReceiptLongIcon;
