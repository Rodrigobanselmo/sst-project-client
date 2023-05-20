import { FC } from 'react';

interface PageCustomProps<T> {
  data: T;
}

export type IPage<T = unknown> = FC<{ children?: any } & PageCustomProps<T>>;
