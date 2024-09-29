import { IOrderByParams } from '@v2/types/order-by-params.type';

export function setOrderByTable<T>(
  orderBy: IOrderByParams<T>,
  actualOrderby: IOrderByParams<T>[],
) {
  const index = actualOrderby.findIndex((o) => o.field === orderBy.field);

  if (index !== -1) {
    if (actualOrderby[index].order !== orderBy.order) {
      actualOrderby[index].order = orderBy.order;
    } else {
      actualOrderby.splice(index, 1);
    }
  } else {
    actualOrderby.push(orderBy);
  }

  return actualOrderby.filter((o) => o.order !== 'none');
}
