import { ReactElement } from 'react';

import { LinkProps } from 'next/link';

import { ModalEnum } from 'core/enums/modal.enums';

export interface IActiveLinkProps extends Omit<LinkProps, 'href' | 'onClick'> {
  children: ReactElement;
  shouldMatchExactHref?: boolean;
  href?: string;
  /** Permite marcar ativo por prefixo (ex.: `/novo/` em qualquer stage). */
  activePrefix?: string;
  /**
   * Força o estado ativo sem usar um prefixo largo.
   * Uso restrito ao pai-link Home da Gestão da Empresa.
   */
  forceActive?: boolean;
  modalName?: ModalEnum;
  canOpen?: boolean;
  isOpen?: boolean;
  /** Quando false, não aplica o deslocamento negativo do toggle de expansão. */
  expandToggleOffset?: boolean;
  onClick?: (e: any) => void;
}
