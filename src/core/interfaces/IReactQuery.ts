import { UseQueryResult } from 'react-query';

export interface IReactQuery<T> extends Omit<UseQueryResult<T>, 'data'> {
  data: T;
}

export interface IPaginationResult<T> {
  data: T;
  count: number;
}

export interface IReactQueryPagination<T>
  extends Omit<UseQueryResult<T>, 'data'> {
  data: T;
  count: number;
}
