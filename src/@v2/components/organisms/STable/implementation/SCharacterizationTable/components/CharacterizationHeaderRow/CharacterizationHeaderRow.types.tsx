import { CharacterizationOrderByEnum } from '@v2/services/security/characterization/browse/service/browse-characterization.types';
import {
  IOrderByParams,
  IOrderDirection,
} from '@v2/types/order-by-params.type';
import { ReactNode } from 'react';

export interface ICharacterizationHeaderRowrops {
  text: ReactNode;
  justify?: 'flex-start' | 'center' | 'flex-end';
  field: CharacterizationOrderByEnum;
  orderByMap: Record<CharacterizationOrderByEnum, IOrderDirection>;
  setOrderBy: (order: IOrderByParams<CharacterizationOrderByEnum>) => void;
}
