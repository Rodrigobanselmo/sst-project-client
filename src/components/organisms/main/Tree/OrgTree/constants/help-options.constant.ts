/* eslint-disable @typescript-eslint/no-explicit-any */
import { ElementType } from 'react';

import CloseFullscreenOutlinedIcon from '@mui/icons-material/CloseFullscreenOutlined';
import OpenInFullOutlinedIcon from '@mui/icons-material/OpenInFullOutlined';

import SDeleteIcon from 'assets/icons/SDeleteIcon';
import { SEditIcon } from 'assets/icons/SEditIcon';

import { HelpOptionsEnum } from '../enums/help-options.enums';

export interface IHelpOption {
  value: HelpOptionsEnum;
  name: string;
  icon: ElementType<any>;
}
interface IHelpOptions extends Record<HelpOptionsEnum, IHelpOption> {}

export const helpOptionsConstant = {
  [HelpOptionsEnum.OPEN_ALL]: {
    value: HelpOptionsEnum.OPEN_ALL,
    name: 'Abrir tudo',
    icon: OpenInFullOutlinedIcon,
  },
  [HelpOptionsEnum.EDIT]: {
    value: HelpOptionsEnum.EDIT,
    name: 'Editar',
    icon: SEditIcon,
  },
  [HelpOptionsEnum.CLOSE_ALL]: {
    value: HelpOptionsEnum.CLOSE_ALL,
    name: 'Fechar tudo',
    icon: CloseFullscreenOutlinedIcon,
  },
  [HelpOptionsEnum.DELETE]: {
    value: HelpOptionsEnum.DELETE,
    name: 'Deletar',
    icon: SDeleteIcon,
  },
} as IHelpOptions;
