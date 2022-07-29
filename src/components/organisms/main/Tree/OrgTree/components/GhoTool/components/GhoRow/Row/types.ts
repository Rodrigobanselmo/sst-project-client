import { IGhoState } from 'store/reducers/hierarchy/ghoSlice';

import { IGho } from 'core/interfaces/api/IGho';

export interface RowItemsProps {
  isSelected?: boolean;
  isFirst?: boolean;
  hide?: boolean;
  data: IGho;
  anchorEl?: any;
  isDeleteLoading?: boolean;
  handleEditGHO?: (data: IGho) => void;
  handleDeleteGHO: (id: string, data?: IGho) => void;
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
