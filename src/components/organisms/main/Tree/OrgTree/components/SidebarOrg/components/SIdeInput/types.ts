import { IGhoState } from 'store/reducers/hierarchy/ghoSlice';

import { IGho } from 'core/interfaces/api/IGho';

export interface SideInputProps {
  isAddLoading?: boolean;
  handleAddGHO: () => Promise<void>;
  handleEditGHO: (data: IGho) => void;
  handleSelectGHO: (
    gho: IGho | null,
    hierarchies: string[],
  ) =>
    | {
        payload: Partial<IGhoState>;
        type: string;
      }
    | undefined;
}
