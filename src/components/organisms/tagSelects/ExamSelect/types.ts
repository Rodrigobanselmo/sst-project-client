import { BoxProps } from '@mui/material';
import { ISTagSearchSelectProps } from 'components/molecules/STagSearchSelect/types';

import { IExam } from 'core/interfaces/api/IExam';

export interface IExamSelectProps
  extends BoxProps,
    Partial<ISTagSearchSelectProps> {
  text?: string;
  tooltipTitle?: string;
  borderActive?: 'error' | 'info' | 'warning' | 'success';
  large?: boolean;
  selected?: (string | number)[];
  multiple?: boolean;
  handleSelect?: (selectedIds: IExam) => void;
  onEnter?: (value: string) => void;
  onlyExam?: boolean;
}
