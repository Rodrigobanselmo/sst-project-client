import { IPopperProps } from '../../../../../molecules/SPopperArrow/types';
import { IFilterIconProps } from '../STableFilterIcon/types';

export type IFilterPopperProps = IPopperProps & {
  data?: any[];
  filterProps: IFilterIconProps;
  /** Opt-in: rodapé com Aplicar / Limpar no painel. Default: oculto. */
  showApplyClearActions?: boolean;
};
