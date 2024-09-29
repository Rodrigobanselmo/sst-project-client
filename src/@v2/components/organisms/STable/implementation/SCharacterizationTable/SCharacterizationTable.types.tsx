import { CharacterizationBrowseResultModel } from '@v2/models/security/models/characterization/characterization-browse-result.model';
import { CharacterizationOrderByEnum } from '@v2/services/security/characterization/browse/service/browse-characterization.types';
import { IOrderByParams } from '@v2/types/order-by-params.type';

export interface ICharacterizationTableTableProps {
  data?: CharacterizationBrowseResultModel[];
  isLoading?: boolean;
  setPage: (page: number) => void;
  setOrderBy: (order: IOrderByParams<CharacterizationOrderByEnum>) => void;
  orderBy?: IOrderByParams<CharacterizationOrderByEnum>[];
  pagination?: {
    total: number;
    limit: number;
    page: number;
  };
}
