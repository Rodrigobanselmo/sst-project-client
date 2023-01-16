import { IPopperProps } from '../../../../../molecules/SPopperArrow/types';
import { IFilterIconProps } from '../STableFilterIcon/types';

export type IFilterPopperProps = IPopperProps & {
  data?: any[];
  filterProps: IFilterIconProps;
};
