import React, { FC } from 'react';

import ImportExportOutlinedIcon from '@mui/icons-material/ImportExportOutlined';

import { IIconMuiProps } from 'core/interfaces/IIconMuiProps';

export const SDatabaseIcon: FC<{ children?: any } & IIconMuiProps> = ({
  ...props
}) => {
  return <ImportExportOutlinedIcon {...props} />;
};

export default ImportExportOutlinedIcon;
