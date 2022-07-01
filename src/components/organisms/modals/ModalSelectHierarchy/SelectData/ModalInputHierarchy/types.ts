import { SInputProps } from 'components/atoms/SInput/types';

import { HierarchyEnum } from 'core/enums/hierarchy.enum';

export interface SideInputProps extends Omit<Partial<SInputProps>, 'onSearch'> {
  isAddLoading?: boolean;
  small?: boolean;
  onSearch: (value: string) => void;
  setFilter: (value: HierarchyEnum) => void;
  filter: HierarchyEnum | '';
  listFilter: Record<HierarchyEnum, boolean>;
  onSelectAll?: () => void;
}
