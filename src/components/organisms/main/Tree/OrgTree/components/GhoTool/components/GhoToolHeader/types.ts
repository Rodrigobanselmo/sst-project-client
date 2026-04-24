/* eslint-disable @typescript-eslint/no-explicit-any */
import { IGhoState } from 'store/reducers/hierarchy/ghoSlice';

import { HomoTypeEnum } from 'core/enums/homo-type.enum';
import { IGho } from 'core/interfaces/api/IGho';

export interface GhoHeaderProps {
  isAddLoading?: boolean;
  inputRef: any;
  filter: HomoTypeEnum | null;
  handleAddGHO: () => Promise<void>;
  handleAddCharacterization?: () => void;
  characterizationAddTooltip?: string;
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
