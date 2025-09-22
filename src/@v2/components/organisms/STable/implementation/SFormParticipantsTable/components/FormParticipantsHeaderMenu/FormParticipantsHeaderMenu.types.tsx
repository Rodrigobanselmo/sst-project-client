import { IOrderDirection } from '@v2/types/order-by-params.type';

export interface IFormParticipantsHeaderMenu {
  close: () => void;
  setOrderBy?: (order: IOrderDirection) => void;
  onClean?: () => void;
  onHidden?: () => void;
  filters?: React.ReactNode;
}
