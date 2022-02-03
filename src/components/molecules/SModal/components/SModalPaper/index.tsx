import React, { FC } from 'react';

import { STModalPaper } from './styles';
import { SModalPaperProps } from './types';

export const SModalPaper: FC<SModalPaperProps> = ({ ...props }) => {
  return <STModalPaper maxWidth={['95%', '95%', 900]} {...props} />;
};
