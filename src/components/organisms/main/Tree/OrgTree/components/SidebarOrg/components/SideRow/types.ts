/* eslint-disable @typescript-eslint/no-explicit-any */
import { IGhoState } from 'store/reducers/hierarchy/ghoSlice';

import { IGho } from 'core/interfaces/api/IGho';
import { IRiskData } from 'core/interfaces/api/IRiskData';

export interface SideRowProps {
  gho: IGho;
  isRiskOpen: boolean;
  isDeleteLoading: boolean;
  selectedGhoId: string | null;
  riskData?: IRiskData;
  handleSelectGHO: (
    gho: IGho | null,
    hierarchies: string[],
  ) =>
    | {
        payload: Partial<IGhoState>;
        type: string;
      }
    | undefined;
  handleDeleteGHO: (id: string) => void;
}
