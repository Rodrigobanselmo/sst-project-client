import React, { FC } from 'react';

import ArticleIcon from '@mui/icons-material/Article';

import { IIconMuiProps } from 'core/interfaces/IIconMuiProps';
export const SDocumentIcon: FC<IIconMuiProps> = ({ ...props }) => {
  return <ArticleIcon {...props} />;
};

export default ArticleIcon;
