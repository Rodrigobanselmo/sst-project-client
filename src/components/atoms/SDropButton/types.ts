import { IMenuOption } from 'components/molecules/SMenu/types';
import { IMenuSearchOption } from 'components/molecules/SMenuSearch/types';
import { MouseEvent } from 'react';

export interface ISDropButton {
  disabled?: boolean;
  tooltipTitle?: string;
  text?: string;
  icon?: any;
  iconButton?: any;
  loading?: boolean;
  onSelect: (option: IMenuSearchOption, e: MouseEvent<HTMLLIElement>) => void;
  options: IMenuOption[];
}
