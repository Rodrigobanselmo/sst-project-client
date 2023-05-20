import React, { FC } from 'react';

import { STLink } from './styles';
import { SLinkProps } from './types';

const SLink: FC<{ children?: any } & SLinkProps> = ({ unstyled, ...props }) => (
  <STLink unstyled={unstyled ? 1 : 0} {...props} />
);

export default SLink;
