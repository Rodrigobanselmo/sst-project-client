import { IGhoState } from 'store/reducers/hierarchy/ghoSlice';

import { HomoTypeEnum } from 'core/enums/homo-type.enum';
import { IGho } from 'core/interfaces/api/IGho';

/* eslint-disable @typescript-eslint/no-explicit-any */

export interface RiskToolRiskViewProps {
  isDeleteLoading: boolean;
  selectedGhoId: string | null;
  handleEditGHO: (data: IGho) => void;
  filter: HomoTypeEnum | null;
  handleFilter: (filter: HomoTypeEnum | null) => void;
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
