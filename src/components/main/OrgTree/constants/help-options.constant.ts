/* eslint-disable @typescript-eslint/no-explicit-any */
import { ElementType } from 'react';

import CloseFullscreenOutlinedIcon from '@mui/icons-material/CloseFullscreenOutlined';
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined';
import ContentPasteGoOutlinedIcon from '@mui/icons-material/ContentPasteGoOutlined';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import OpenInFullOutlinedIcon from '@mui/icons-material/OpenInFullOutlined';

import { HelpOptionsEnum } from '../enums/help-options.enums';
export interface IHelpOption {
  value: HelpOptionsEnum;
  name: string;
  icon: ElementType<any>;
}
interface IHelpOptions extends Record<HelpOptionsEnum, IHelpOption> {}

export const helpOptionsConstant = {
  [HelpOptionsEnum.COPY]: {
    value: HelpOptionsEnum.COPY,
    name: 'Copiar',
    icon: InsertDriveFileOutlinedIcon,
  },
  [HelpOptionsEnum.COPY_ALL]: {
    value: HelpOptionsEnum.COPY_ALL,
    name: 'Copiar tudo',
    icon: ContentCopyOutlinedIcon,
  },
  [HelpOptionsEnum.PASTE]: {
    value: HelpOptionsEnum.PASTE,
    name: 'Colar',
    icon: ContentPasteGoOutlinedIcon,
  },
  [HelpOptionsEnum.OPEN_ALL]: {
    value: HelpOptionsEnum.OPEN_ALL,
    name: 'Abrir tudo',
    icon: OpenInFullOutlinedIcon,
  },
  [HelpOptionsEnum.CLOSE_ALL]: {
    value: HelpOptionsEnum.CLOSE_ALL,
    name: 'Fechar tudo',
    icon: CloseFullscreenOutlinedIcon,
  },
} as IHelpOptions;
