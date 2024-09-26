export type IOrderByParams<T = string> = {
  field: T;
  order: 'asc' | 'desc';
}[];
