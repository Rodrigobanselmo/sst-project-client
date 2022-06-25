/* eslint-disable @typescript-eslint/no-explicit-any */
import { IGhoState } from 'store/reducers/hierarchy/ghoSlice';

import { IGho } from 'core/interfaces/api/IGho';

export interface GhoToolTopProps {
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
