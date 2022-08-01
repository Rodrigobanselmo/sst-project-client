import { SInputProps } from 'components/atoms/SInput/types';

import { HierarchyEnum } from 'core/enums/hierarchy.enum';

export interface SideInputProps extends Omit<Partial<SInputProps>, 'onSearch'> {
  isAddLoading?: boolean;
  small?: boolean;
  onSearch: (value: string) => void;
  setFilter: (value: HierarchyEnum | 'GHO') => void;
  filter: HierarchyEnum | '' | 'GHO';
  listFilter: Record<HierarchyEnum, boolean>;
  onSelectAll?: () => void;
  onEmployeeAdd?: () => void;
}
