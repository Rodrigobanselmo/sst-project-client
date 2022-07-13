import { BoxProps } from '@mui/material';
import { ISTagSearchSelectProps } from 'components/molecules/STagSearchSelect/types';
import { ITreeSelectedItem } from 'components/organisms/main/Tree/OrgTree/interfaces';

import { IEmployee } from 'core/interfaces/api/IEmployee';

export interface IEmployeeSelectProps
  extends BoxProps,
    Partial<ISTagSearchSelectProps> {
  text?: string;
  tooltipTitle?: string;
  large?: boolean;
  actualHierarchy?: ITreeSelectedItem;
  selected?: number[];
  selectedEmployees?: IEmployee[];
  multiple?: boolean;
  handleSelect?: (selectedIds: number[] | IEmployee, list: IEmployee[]) => void;
  handleMultiSelect?: (selected: IEmployee) => void;
  onEnter?: (value: string) => void;
}