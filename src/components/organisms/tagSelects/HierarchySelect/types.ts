import { ReactNode } from 'react';

import { ISTagSearchSelectProps } from 'components/molecules/STagSearchSelect/types';

import { HierarchyEnum } from 'core/enums/hierarchy.enum';
import { IHierarchy } from 'core/interfaces/api/IHierarchy';

interface IHierarchyTypeSelectBaseProps
  extends Partial<Omit<ISTagSearchSelectProps, 'multiple'>> {
  large?: boolean;
  text?: string;
  defaultFilter?: HierarchyEnum;
  filterOptions?: HierarchyEnum[];
  selectedId?: string;
  allFilters?: boolean;
  disabled?: boolean;
  bg?: string;
  companyId?: string;
  tooltipText?: (value: string) => ReactNode;
  parentId?: string;
  borderActive?: 'error' | 'info' | 'warning' | 'success';
}
interface IHierarchyTypeSelectMultipleProps {
  multiple: true;
  handleSelect?: (selected: IHierarchy[]) => void;
}

interface IHierarchyTypeSelectSingleProps {
  multiple?: false;
  handleSelect?: (selected: IHierarchy, parents: IHierarchy[]) => void;
}
export type IHierarchyTypeSelectProps = IHierarchyTypeSelectBaseProps &
  (IHierarchyTypeSelectMultipleProps | IHierarchyTypeSelectSingleProps);
