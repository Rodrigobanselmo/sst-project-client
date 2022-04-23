/* eslint-disable @typescript-eslint/no-explicit-any */
import { IGhoState } from 'store/reducers/hierarchy/ghoSlice';

import { IGho } from 'core/interfaces/api/IGho';

export interface SideHeaderProps {
  isAddLoading?: boolean;
  riskInit?: boolean;
  inputRef: any;
  handleAddGHO: () => Promise<void>;
  handleEditGHO: (id: string) => void;
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
