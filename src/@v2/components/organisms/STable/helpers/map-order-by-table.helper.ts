import { CharacterizationOrderByEnum } from '@v2/services/security/characterization/browse/service/browse-characterization.types';
import {
  IOrderByParams,
  IOrderDirection,
} from '@v2/types/order-by-params.type';

export function mapOrderByTable<T extends string>(
  orderBy: IOrderByParams<T>[] = [],
) {
  const map = {} as Record<T, IOrderDirection>;

  orderBy.forEach((order) => {
    map[order.field] = order.order;
  });

  return map;
}
