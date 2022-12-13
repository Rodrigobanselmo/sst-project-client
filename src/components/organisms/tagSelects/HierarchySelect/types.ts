import { ReactNode } from 'react';

import { ISTagSearchSelectProps } from 'components/molecules/STagSearchSelect/types';

import { HierarchyEnum } from 'core/enums/hierarchy.enum';
import { IHierarchy } from 'core/interfaces/api/IHierarchy';

export interface ITypeSelectProps extends Partial<ISTagSearchSelectProps> {
  large?: boolean;
  handleSelect?: (selected: IHierarchy, parents: IHierarchy[]) => void;
  text?: string;
  defaultFilter?: HierarchyEnum;
  filterOptions?: HierarchyEnum[];
  selectedId?: string;
  disabled?: boolean;
  bg?: string;
  companyId?: string;
  tooltipText?: (value: string) => ReactNode;
  parentId?: string;
  borderActive?: 'error' | 'info' | 'warning' | 'success';
}
