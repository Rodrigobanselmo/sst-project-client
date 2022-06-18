import { SInputProps } from 'components/atoms/SInput/types';
import { IGhoState } from 'store/reducers/hierarchy/ghoSlice';

import { IGho } from 'core/interfaces/api/IGho';

export interface SideInputProps extends Omit<Partial<SInputProps>, 'onSearch'> {
  isAddLoading?: boolean;
  small?: boolean;
  onSearch?: (value: string) => void;
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
