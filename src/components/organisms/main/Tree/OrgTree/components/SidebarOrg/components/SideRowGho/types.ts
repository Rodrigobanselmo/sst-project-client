import { IGhoState } from 'store/reducers/hierarchy/ghoSlice';

import { IGho } from 'core/interfaces/api/IGho';

export interface SideItemsProps {
  isSelected?: boolean;
  hide?: boolean;
  data: IGho;
  isDeleteLoading?: boolean;
  handleEditGHO: (data: IGho) => void;
  handleDeleteGHO: (id: string) => void;
  handleSelectGHO: (
    data: IGho | null,
    hierarchies: string[],
  ) =>
    | {
        payload: Partial<IGhoState>;
        type: string;
      }
    | undefined;
}
