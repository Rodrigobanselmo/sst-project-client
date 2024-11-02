import { IOrderByParams } from '@v2/types/order-by-params.type';
import { setOrderByTable } from '@v2/components/organisms/STable/helpers/set-order-by-table.helper';
import { STableFilterChipProps } from '@v2/components/organisms/STable/addons/addons-table/STableFilterChip/STableFilterChip';

export function useOrderBy<T>({
  orderByList = [],
  getLabel,
  getLeftLabel,
  setOrderBy,
}: {
  orderByList?: IOrderByParams<T>[];
  setOrderBy: (orderBy: IOrderByParams<T>[]) => void;
  getLabel: (order: IOrderByParams<T>) => string;
  getLeftLabel: (order: IOrderByParams<T>) => string;
}) {
  const onOrderBy = (order: IOrderByParams<T>) => {
    const orderBy = setOrderByTable(order, orderByList || []);
    setOrderBy(orderBy);
  };

  const orderChipList = orderByList?.map<STableFilterChipProps>((order) => ({
    label: getLabel(order),
    leftLabel: `ordenação por ${getLeftLabel(order)}:`,
    onDelete: () => {
      order.order = 'none';
      onOrderBy(order);
    },
  }));

  return { orderChipList, onOrderBy };
}
