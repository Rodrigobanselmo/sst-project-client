import { IGhoState } from 'store/reducers/hierarchy/ghoSlice';

import { IGho } from 'core/interfaces/api/IGho';

import { ViewsDataEnum } from '../../utils/view-data-type.constant';

export interface SideSelectViewContentProps {
  ghoQuery: IGho[];
  viewDataType: ViewsDataEnum;
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
