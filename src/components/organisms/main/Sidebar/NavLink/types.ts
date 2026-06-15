import { ElementType } from 'react';

import { LinkProps } from '@mui/material';

import { ModalEnum } from 'core/enums/modal.enums';

export interface INavLinkProps extends LinkProps {
  icon: ElementType;
  href?: string;
  /** Prefixo opcional para matcher de item ativo. */
  activePrefix?: string;
  modalName?: ModalEnum;
  text: string;
  description: string;
  image?: string;
  deep?: number;
  imageType?: 'cat' | 'esocial';
  shouldMatchExactHref?: boolean;
  isAlwaysClose?: boolean;
  canOpen?: boolean;
  /** Quando definido, controla expansão do submenu conforme a rota atual. */
  forceShowSubItems?: boolean;
  /** Itens principais de um mesmo grupo (ex.: Cadastro), alinhados entre si. */
  isMenuPeer?: boolean;
  /** Quando false, evita deslocamento do toggle de expansão em submenus pares. */
  expandToggleOffset?: boolean;
}
