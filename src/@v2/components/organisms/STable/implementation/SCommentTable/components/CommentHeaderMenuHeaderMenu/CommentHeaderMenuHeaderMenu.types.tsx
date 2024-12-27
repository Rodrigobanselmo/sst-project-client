import { IOrderDirection } from '@v2/types/order-by-params.type';

export interface ICommentHeaderMenuHeaderMenuProps {
  close: () => void;
  setOrderBy?: (order: IOrderDirection) => void;
  onClean?: () => void;
  onHidden?: () => void;
  filters?: React.ReactNode;
}
