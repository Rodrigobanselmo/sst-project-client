import { IOrderDirection } from '@v2/types/order-by-params.type';

export interface IActionPlanHeaderMenuProps {
  close: () => void;
  setOrderBy?: (order: IOrderDirection) => void;
  onClean?: () => void;
  onHidden?: () => void;
  filters?: React.ReactNode;
}
