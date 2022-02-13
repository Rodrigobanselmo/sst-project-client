import { UseQueryResult } from 'react-query';

export interface IReactQuery<T> extends Omit<UseQueryResult<T>, 'data'> {
  data: T;
}
