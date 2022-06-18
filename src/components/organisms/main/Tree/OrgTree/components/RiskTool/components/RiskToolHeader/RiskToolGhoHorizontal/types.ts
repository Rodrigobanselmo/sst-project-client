import { IGhoState } from 'store/reducers/hierarchy/ghoSlice';

import { IGho } from 'core/interfaces/api/IGho';

import { ViewTypeEnum } from '../../../utils/view-type.constant';

export interface SideSelectViewContentProps {
  ghoQuery: IGho[];
  viewType: ViewTypeEnum;
  inputRef: React.RefObject<HTMLInputElement>;
  handleAddGHO?: () => Promise<void>;
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
