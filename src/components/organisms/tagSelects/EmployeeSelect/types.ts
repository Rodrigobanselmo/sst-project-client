import { BoxProps } from '@mui/material';
import { ISTagSearchSelectProps } from 'components/molecules/STagSearchSelect/types';
import { ITreeSelectedItem } from 'components/organisms/main/Tree/OrgTree/interfaces';

import { IEmployee } from 'core/interfaces/api/IEmployee';
import { IHierarchy } from 'core/interfaces/api/IHierarchy';
import { IQueryEmployee } from 'core/services/hooks/queries/useQueryEmployees';

export interface IEmployeeSelectProps
  extends BoxProps,
    Partial<ISTagSearchSelectProps> {
  text?: string;
  tooltipTitle?: string;
  filterByHierarchyId?: string;
  large?: boolean;
  editOnSelection?: boolean;
  actualHierarchy?: ITreeSelectedItem | IHierarchy;
  selected?: number[];
  preload?: boolean;
  addButton?: boolean;
  maxPerPage?: number;
  selectedEmployees?: IEmployee[];
  multiple?: boolean;
  queryEmployee?: IQueryEmployee;
  handleSelect?: (
    selectedIds: number[] | IEmployee | any,
    list: IEmployee[],
  ) => void;
  handleMultiSelect?: (selected: IEmployee) => void;
  handleAddEmployee?: (selected: IEmployee, close: () => void) => void;
  onEnter?: (value: string) => void;
}
