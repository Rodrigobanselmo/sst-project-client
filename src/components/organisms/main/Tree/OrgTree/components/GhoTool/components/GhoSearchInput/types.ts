import { SInputProps } from 'components/atoms/SInput/types';
import { IGhoState } from 'store/reducers/hierarchy/ghoSlice';

import { IGho } from 'core/interfaces/api/IGho';

export interface GhoInputProps extends Omit<Partial<SInputProps>, 'onSearch'> {
  isAddLoading?: boolean;
  small?: boolean;
  debounceTime?: number;
  onSearch?: (value: string) => void;
  handleAddGHO?: () => Promise<void>;
  handleEditGHO?: (data: IGho) => void;
  handleSelectGHO?: (
    gho: IGho | null,
    hierarchies: string[],
  ) =>
    | {
        payload: Partial<IGhoState>;
        type: string;
      }
    | undefined;
}
