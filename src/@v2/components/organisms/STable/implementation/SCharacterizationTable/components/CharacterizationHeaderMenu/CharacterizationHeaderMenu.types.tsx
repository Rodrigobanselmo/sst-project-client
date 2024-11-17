import { CharacterizationOrderByEnum } from '@v2/services/security/characterization/browse-characterization/service/browse-characterization.types';
import { IOrderDirection } from '@v2/types/order-by-params.type';

export interface ICharacterizationHeaderMenuProps {
  close: () => void;
  setOrderBy: (order: IOrderDirection) => void;
  onClean?: () => void;
  onHidden?: () => void;
  filters?: React.ReactNode;
}
