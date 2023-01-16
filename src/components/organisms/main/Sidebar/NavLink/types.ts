import { ElementType } from 'react';

import { LinkProps } from '@mui/material';

import { ModalEnum } from 'core/enums/modal.enums';

export interface INavLinkProps extends LinkProps {
  icon: ElementType;
  href?: string;
  modalName?: ModalEnum;
  text: string;
  description: string;
  image?: string;
  imageType?: 'cat';
  shouldMatchExactHref?: boolean;
  isAlwaysClose?: boolean;
}
