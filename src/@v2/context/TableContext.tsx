import { createContext, ReactNode, useContext } from 'react';

import {
  IOrderByParams,
  IOrderDirection,
} from '@v2/types/order-by-params.type';
import { mapOrderByTable } from '@v2/components/organisms/STable/helpers/map-order-by-table.helper';

interface TableContextData<T> {
  setOrderBy: (order: IOrderByParams<T>) => void;
  orderBy: IOrderByParams<T>[];
  orderByMap: Record<keyof T, IOrderDirection>;
}

interface ITableProps<T> {
  children: ReactNode;
  setOrderBy: (order: IOrderByParams<T>) => void;
  orderBy: IOrderByParams<T>[];
}

const TableContext = createContext({} as TableContextData<any>);

export function TableProvider<T extends string>({
  children,
  setOrderBy,
  orderBy,
}: ITableProps<T>): JSX.Element {
  const orderByMap = mapOrderByTable<T>(orderBy);

  return (
    <TableContext.Provider value={{ setOrderBy, orderBy, orderByMap }}>
      {children}
    </TableContext.Provider>
  );
}

export function useTable<T>(): TableContextData<T> {
  return useContext(TableContext);
}
