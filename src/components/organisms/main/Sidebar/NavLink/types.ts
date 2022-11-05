import { ElementType } from 'react';

import { LinkProps } from '@mui/material';

export interface INavLinkProps extends LinkProps {
  icon: ElementType;
  href: string;
  text: string;
  description: string;
  image?: string;
  shouldMatchExactHref?: boolean;
  isAlwaysClose?: boolean;
}
