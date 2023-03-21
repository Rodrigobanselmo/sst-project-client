import { ReactElement } from 'react';

import { LinkProps } from 'next/link';

import { ModalEnum } from 'core/enums/modal.enums';

export interface IActiveLinkProps extends Omit<LinkProps, 'href' | 'onClick'> {
  children: ReactElement;
  shouldMatchExactHref?: boolean;
  href?: string;
  modalName?: ModalEnum;
  canOpen?: boolean;
  isOpen?: boolean;
  onClick?: (e: any) => void;
}
