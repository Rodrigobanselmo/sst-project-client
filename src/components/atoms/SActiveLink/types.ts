import { ReactElement } from 'react';

import { LinkProps } from 'next/link';

import { ModalEnum } from 'core/enums/modal.enums';

export interface IActiveLinkProps extends Omit<LinkProps, 'href' | 'onClick'> {
  children: ReactElement;
  shouldMatchExactHref?: boolean;
  href?: string;
  /** Permite marcar ativo por prefixo (ex.: `/novo/` em qualquer stage). */
  activePrefix?: string;
  modalName?: ModalEnum;
  canOpen?: boolean;
  isOpen?: boolean;
  /** Quando false, não aplica o deslocamento negativo do toggle de expansão. */
  expandToggleOffset?: boolean;
  onClick?: (e: any) => void;
}
