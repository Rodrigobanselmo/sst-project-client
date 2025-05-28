import { IOrderDirection } from '@v2/types/order-by-params.type';

export interface IFormApplicationHeaderMenu {
  close: () => void;
  setOrderBy?: (order: IOrderDirection) => void;
  onClean?: () => void;
  onHidden?: () => void;
  filters?: React.ReactNode;
}
