export type IOrderDirection = 'asc' | 'desc' | 'none';

export type IOrderByParams<T = string> = {
  field: T;
  order: IOrderDirection;
};
