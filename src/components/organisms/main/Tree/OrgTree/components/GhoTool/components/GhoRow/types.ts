/* eslint-disable @typescript-eslint/no-explicit-any */
import { IGhoState } from 'store/reducers/hierarchy/ghoSlice';

import { IGho } from 'core/interfaces/api/IGho';

export interface GhoRowProps {
  gho: IGho;
  isFirst?: boolean;
  isDeleteLoading: boolean;
  selectedGhoId: string | null;
  handleEditGHO?: (data: IGho) => void;
  handleSelectGHO: (
    gho: IGho | null,
    hierarchies: string[],
  ) =>
    | {
        payload: Partial<IGhoState>;
        type: string;
      }
    | undefined;
  handleDeleteGHO: (id: string, data?: IGho) => void;
}
