import React, { FC } from 'react';

import LibraryAddCheckIcon from '@mui/icons-material/LibraryAddCheck';

import { IIconMuiProps } from 'core/interfaces/IIconMuiProps';

export const SDocumentVersionIcon: FC<IIconMuiProps> = ({ ...props }) => {
  return <LibraryAddCheckIcon {...props} />;
};

export default LibraryAddCheckIcon;
