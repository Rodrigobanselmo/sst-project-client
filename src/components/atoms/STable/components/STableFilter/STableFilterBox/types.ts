import { SFlexProps } from 'components/atoms/SFlex/types';

import { IFilterIconProps } from '../STableFilterIcon/types';

export type IFilterBoxProps = SFlexProps & {
  filterProps: IFilterIconProps;
  closePopper?: () => void;
};
