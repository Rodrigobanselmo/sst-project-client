import { ReactElement } from 'react';

import { LinkProps } from 'next/link';

import { ModalEnum } from 'core/enums/modal.enums';

export interface IActiveLinkProps extends Omit<LinkProps, 'href'> {
  children: ReactElement;
  shouldMatchExactHref?: boolean;
  href?: string;
  modalName?: ModalEnum;
}
