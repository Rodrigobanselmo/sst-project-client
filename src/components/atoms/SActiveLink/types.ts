import { ReactElement } from 'react';

import { LinkProps } from 'next/link';

export interface IActiveLinkProps extends LinkProps {
  children: ReactElement;
  shouldMatchExactHref?: boolean;
}
