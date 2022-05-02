import { BoxProps } from '@mui/material';
import { ISTagSearchSelectProps } from 'components/molecules/STagSearchSelect/types';

import { IEpi } from 'core/interfaces/api/IEpi';

export interface IEpiSelectProps
  extends BoxProps,
    Partial<ISTagSearchSelectProps> {
  text?: string;
  tooltipTitle?: string;
  large?: boolean;
  selected?: (string | number)[];
  multiple?: boolean;
  handleSelect?: (selectedIds: string[] | IEpi) => void;
  onEnter?: (value: string) => void;
}
