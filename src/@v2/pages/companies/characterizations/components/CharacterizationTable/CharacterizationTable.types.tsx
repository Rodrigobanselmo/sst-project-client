import { CharacterizationOrderByEnum } from '@v2/services/security/characterization/browse/service/browse-characterization.types';
import { IOrderByParams } from '@v2/types/order-by-params.type';

export interface ICharacterizationFilterProps {
  search?: string;
  page?: number;
  limit?: number;
  orderBy?: IOrderByParams<CharacterizationOrderByEnum>[];
}
