import { SFlexProps } from 'components/atoms/SFlex/types';

import { IFilterIconProps } from '../STableFilterIcon/types';
import { StatusEnum } from 'project/enum/status.enum';

export type IFilterBoxProps = SFlexProps & {
  filterProps: IFilterIconProps;
  closePopper?: () => void;
};
